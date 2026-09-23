/* ==========================================================================
   Two Plates, One Table — app logic (planner / recipes / shopping / pantry)
   ========================================================================== */

const OCADO_BASE = "https://www.ocado.com/search?entry=";
function ocadoUrl(q) { return OCADO_BASE + encodeURIComponent(q); }

function mealsById() {
  const map = {};
  MEALS.forEach(m => (map[m.id] = m));
  return map;
}
const MEALS_BY_ID = mealsById();

function mealsOfCategory(cat) {
  return MEALS.filter(m => m.category === cat);
}
function uniqueFacet(list, key) {
  return Array.from(new Set(list.map(m => m[key]))).sort();
}

/* ---------------------------------------------------------
   CUSTOM RECIPES — anyone (household or a personal profile) can
   add their own dish from the "My Recipes" tab. These live in
   STATE.customMeals so they sync exactly like everything else,
   and sit alongside the built-in MEALS pool everywhere: the
   picker, the Recipes tab, and the shopping list.
--------------------------------------------------------- */
let CUSTOM_BY_ID = {};
function rebuildCustomIndex() {
  CUSTOM_BY_ID = {};
  (STATE.customMeals || []).forEach(m => (CUSTOM_BY_ID[m.id] = m));
}
function mealById(id) {
  return MEALS_BY_ID[id] || CUSTOM_BY_ID[id];
}

/* ---------------------------------------------------------
   PROFILES — a personal link (?p=code) gives someone their own
   filtered pool, calorie target and plan, synced separately from
   the shared household plan below (which stays exactly as before
   when there's no ?p= in the URL).
--------------------------------------------------------- */
const URL_PARAMS = new URLSearchParams(location.search);
const PROFILE_CODE = (URL_PARAMS.get("p") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
const IS_PROFILE = !!PROFILE_CODE;

let PROFILE = null; // { name, calorieTarget, vegetarian, dairyFree, glutenFree, allergens: [], avoid: [], favCuisines: [], favIngredients: [] }
let PLAN = DEFAULT_PLAN; // the 14-day skeleton actually rendered — swapped for a profile's own on boot
let POOL = MEALS;         // the meal pool actually offered — filtered per-profile on boot
let TARGET_KCAL = 1300;

// Common allergens/intolerances someone might want to avoid, beyond the
// vegetarian/dairy-free/gluten-free toggles. Matched against each meal's
// curated `allergens` array in data.js (checked against real ingredients,
// not guessed from ingredient text) — so a meal only gets excluded when it
// genuinely contains that allergen.
const ALLERGEN_OPTIONS = [
  { key: "egg", label: "Egg" },
  { key: "fish", label: "Fish" },
  { key: "shellfish", label: "Shellfish" },
  { key: "treenut", label: "Tree nuts" },
  { key: "peanut", label: "Peanuts" },
  { key: "soy", label: "Soy" },
  { key: "sesame", label: "Sesame" },
  { key: "mustard", label: "Mustard" }
];

/* ---------------------------------------------------------
   HOUSEHOLD SETUP — the shared plan (no ?p=) supports however
   many people are eating from it. The first person's calorie
   target and dietary filters drive which meals populate the plan
   shown here (there's one shared dish per slot, so only one set
   of hard filters can apply); everyone else is recorded with
   their own name, diet notes and whether they want a carb side
   with dinner — that's what turns the old fixed "for him" line
   into a per-person one. Defaults below match the plan's original
   fixed behaviour, so nothing changes until someone opens
   "Household setup" and edits it.
--------------------------------------------------------- */
function defaultHousehold() {
  return {
    people: [
      { name: "You", kcal: 1300, vegetarian: false, dairyFree: false, glutenFree: true, allergens: [], eveningCarbs: false, notes: "" },
      { name: "Him", kcal: null, vegetarian: false, dairyFree: true, glutenFree: false, allergens: [], eveningCarbs: true, notes: "butter is fine" }
    ]
  };
}
let HOUSEHOLD = defaultHousehold();

function profileLocalKey(suffix) { return `twoPlatesProfile:${PROFILE_CODE}:${suffix}`; }
function loadProfileLocal() {
  try { return JSON.parse(localStorage.getItem(profileLocalKey("settings")) || "null"); } catch (e) { return null; }
}
function loadProfileLocalState() {
  try { return JSON.parse(localStorage.getItem(profileLocalKey("state")) || "null"); } catch (e) { return null; }
}

function passesFilters(m) {
  if (!PROFILE) return true;
  if (PROFILE.vegetarian && !m.vegetarian) return false;
  if (PROFILE.dairyFree && !m.dairyFree) return false;
  if (PROFILE.glutenFree && !m.gf) return false;
  if (PROFILE.allergens && PROFILE.allergens.length) {
    const mealAllergens = m.allergens || [];
    if (PROFILE.allergens.some(a => mealAllergens.includes(a))) return false;
  }
  if (PROFILE.avoid && PROFILE.avoid.length) {
    const text = (m.title + " " + m.ingredients.map(i => i.text).join(" ") + (m.hisAdd ? " " + m.hisAdd.text : "")).toLowerCase();
    if (PROFILE.avoid.some(a => a && text.includes(a))) return false;
  }
  return true;
}
function isFavourite(m) {
  if (!PROFILE) return false;
  return (PROFILE.favCuisines || []).includes(m.cuisine) || (PROFILE.favIngredients || []).includes(m.mainIngredient);
}
function favBadge(m) {
  return isFavourite(m) ? `<span class="badge fav">★ Favourite</span>` : "";
}

// Every profile gets the same 14-day/weekday skeleton as the household
// plan, but each slot's starting dish is the first thing in HER filtered
// pool for that meal type, not the fixed household defaults.
// A 14-day plan built from the DEFAULT_PLAN skeleton, keeping each slot's
// usual default meal where it still passes the current pool's filters, and
// only substituting a different dish (the first match in the pool) where
// it doesn't. Used for a fresh profile's plan and for the shared household
// plan once someone sets dietary filters on it.
function buildFilteredPlan(pool) {
  return DEFAULT_PLAN.map(day => ({
    n: day.n, week: day.week, weekday: day.weekday,
    slots: day.slots.map(s => {
      const stillValid = pool.some(m => m.id === s.id);
      if (stillValid) return { k: s.k, id: s.id };
      const sub = pool.find(m => m.category === s.k) || MEALS.find(m => m.category === s.k);
      return { k: s.k, id: sub.id };
    })
  }));
}
function buildProfilePlan() {
  return buildFilteredPlan(POOL);
}

// Diet summary bits shared by the profile chrome and the household chrome
// below — takes any {glutenFree, vegetarian, dairyFree, allergens, avoid,
// notes} shaped object and turns it into readable fragments.
function dietSummaryBits(p) {
  const bits = [];
  if (p.glutenFree) bits.push("gluten-free only");
  if (p.vegetarian) bits.push("vegetarian only");
  if (p.dairyFree) bits.push("dairy-free only");
  const allergenLabels = (p.allergens || []).map(key => (ALLERGEN_OPTIONS.find(a => a.key === key) || {}).label).filter(Boolean);
  if (allergenLabels.length) bits.push(`no ${allergenLabels.join(", ").toLowerCase()}`);
  if (p.avoid && p.avoid.length) bits.push(`avoiding ${p.avoid.join(", ")}`);
  if (p.notes) bits.push(p.notes);
  return bits;
}

// The pool actually offered: the built-in meals (filtered to a profile's
// preferences, or — in household mode — the first person's preferences
// from the household setup) plus anything added via "My Recipes". Custom
// recipes are never hidden by the filters above, since the person chose
// to add them.
function rebuildPool() {
  let builtin;
  if (IS_PROFILE) {
    builtin = MEALS.filter(passesFilters);
    TARGET_KCAL = PROFILE ? (PROFILE.calorieTarget || 1600) : 1600;
  } else {
    const primary = (HOUSEHOLD.people && HOUSEHOLD.people[0]) || {};
    builtin = MEALS.filter(m => passesHouseholdFilters(m, primary));
    TARGET_KCAL = primary.kcal || 1300;
  }
  const combined = builtin.concat(STATE.customMeals || []);
  POOL = combined.length ? combined : MEALS;
}
function passesHouseholdFilters(m, primary) {
  if (primary.vegetarian && !m.vegetarian) return false;
  if (primary.dairyFree && !m.dairyFree) return false;
  if (primary.glutenFree && !m.gf) return false;
  if (primary.allergens && primary.allergens.length) {
    const mealAllergens = m.allergens || [];
    if (primary.allergens.some(a => mealAllergens.includes(a))) return false;
  }
  return true;
}

/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */
let STATE = { plan: {}, checks: {} };

function planKey(dayN, slotK) { return `${dayN}:${slotK}`; }
function currentMealId(day, slot) {
  return STATE.plan[planKey(day.n, slot.k)] || slot.id;
}
function setMeal(day, slot, mealId) {
  const key = planKey(day.n, slot.k);
  if (mealId === slot.id) delete STATE.plan[key];
  else STATE.plan[key] = mealId;
}
function isOn(key) { return !!STATE.checks[key]; }
function toggleCheck(key) {
  STATE.checks[key] = !STATE.checks[key];
  renderAll();
  persist();
}

function persistProfile() {
  try {
    localStorage.setItem(profileLocalKey("settings"), JSON.stringify(PROFILE));
    localStorage.setItem(profileLocalKey("state"), JSON.stringify(STATE));
  } catch (e) {}
  if (SYNC.savePath) {
    SYNC.savePath(`profiles/${PROFILE_CODE}/settings`, PROFILE);
    SYNC.savePath(`profiles/${PROFILE_CODE}/state`, STATE);
  }
}

function persist() {
  if (IS_PROFILE) persistProfile();
  else SYNC.save(STATE);
}

/* ---------------------------------------------------------
   PLANNER
--------------------------------------------------------- */
function dayTotal(day) {
  return day.slots.reduce((sum, s) => sum + (mealById(currentMealId(day, s)).kcal || 0), 0);
}

function renderHouseholdCarbLines(meal) {
  if (IS_PROFILE) return "";
  const others = (HOUSEHOLD.people || []).slice(1);
  if (!others.length || !meal.hisAdd) return "";
  return others.filter(p => p.eveningCarbs)
    .map(p => `<div class="his-line">+ for ${p.name || "them"}: <b>${meal.hisAdd.text}</b></div>`).join("");
}

function renderPlan() {
  let html = "";
  [1, 2].forEach(w => {
    html += `<div class="week-heading"><h2>Week ${w}</h2><span>shift the whole plan to whichever week suits you</span></div>`;
    PLAN.filter(d => d.week === w).forEach(day => {
      const total = dayTotal(day);
      const overTarget = total > TARGET_KCAL + 50;
      html += `<div class="day-card"><div class="day-card-head"><h3>${day.weekday}</h3><span class="day-total tabular ${overTarget ? "over" : ""}">~${total} kcal / ${TARGET_KCAL}</span></div>`;
      day.slots.forEach(s => {
        const mealId = currentMealId(day, s);
        const meal = mealById(mealId);
        const checkKey = `meal:${day.n}:${s.k}`;
        const on = isOn(checkKey);
        html += `<div class="slot ${on ? "done" : ""}">
          <div class="check ${on ? "on" : ""}" data-key="${checkKey}" onclick="toggleCheck('${checkKey}')"></div>
          <div class="slot-body">
            <div class="slot-top">
              <div>
                <span class="slot-tag">${SLOT_LABELS[s.k]}</span><br>
                <div class="slot-name-row">
                  <span class="slot-name"><a href="#r-${mealId}" onclick="goRecipe(event,'${mealId}')">${meal.title}</a></span>
                  <button class="swap-btn" onclick="openPicker(${day.n}, '${s.k}')">Choose meal</button>
                </div>
                <div class="slot-meta">${meal.cuisine} · ${meal.mainIngredient}</div>
              </div>
              <div class="slot-kcal tabular">~${meal.kcal} kcal</div>
            </div>
            ${IS_PROFILE ? (meal.hisAdd ? `<div class="his-line">+ optional carb side: <b>${meal.hisAdd.text}</b></div>` : "") : renderHouseholdCarbLines(meal)}
          </div>
        </div>`;
      });
      html += `</div>`;
    });
  });
  document.getElementById("plan-root").innerHTML = html;
}

/* ---------------------------------------------------------
   MEAL PICKER (tap-to-choose — the mobile-friendly alternative
   to drag-and-drop: browse the pool, filter by cuisine or main
   ingredient, tap a card to assign it to that slot)
--------------------------------------------------------- */
let pickerDayN = null;
let pickerSlotK = null;
let pickerMealType = "all";
let pickerCuisine = "all";
let pickerIngredient = "all";

function openPicker(dayN, slotK) {
  pickerDayN = dayN;
  pickerSlotK = slotK;
  pickerMealType = "all";
  pickerCuisine = "all";
  pickerIngredient = "all";

  const overlay = document.createElement("div");
  overlay.className = "picker-overlay";
  overlay.id = "picker-overlay";
  overlay.innerHTML = `
    <div class="picker-panel">
      <div class="picker-head">
        <h3 id="picker-title"></h3>
        <button class="picker-close" onclick="closePicker()" aria-label="Close">&times;</button>
      </div>
      <div class="picker-filters" id="picker-filters"></div>
      <div class="picker-grid" id="picker-grid"></div>
    </div>`;
  overlay.addEventListener("click", e => { if (e.target === overlay) closePicker(); });
  document.body.appendChild(overlay);
  document.addEventListener("keydown", pickerEscHandler);
  renderPicker();
}

function pickerEscHandler(e) { if (e.key === "Escape") closePicker(); }

function closePicker() {
  const overlay = document.getElementById("picker-overlay");
  if (overlay) overlay.remove();
  document.removeEventListener("keydown", pickerEscHandler);
  pickerDayN = null;
  pickerSlotK = null;
}

function setPickerFacet(kind, value) {
  if (kind === "type") pickerMealType = value;
  else if (kind === "cuisine") pickerCuisine = value;
  else pickerIngredient = value;
  renderPicker();
}

function renderPicker() {
  if (pickerDayN === null) return;
  const day = PLAN.find(d => d.n === pickerDayN);
  const slot = day.slots.find(s => s.k === pickerSlotK);
  const currentId = currentMealId(day, slot);
  const pool = POOL; // the whole (filtered, if you have a personal profile) pool

  document.getElementById("picker-title").textContent = `Choose a meal for ${day.weekday} ${SLOT_LABELS[pickerSlotK].toLowerCase()}`;

  const mealTypes = uniqueFacet(pool, "category").map(c => SLOT_LABELS[c]);
  const cuisines = uniqueFacet(pool, "cuisine");
  const ingredients = uniqueFacet(pool, "mainIngredient");
  const chipRow = (label, all, current, kind) => `
    <div class="picker-filter-group">
      <span class="picker-filter-label">${label}</span>
      <div class="picker-chips">
        <button class="chip ${current === "all" ? "active" : ""}" onclick="setPickerFacet('${kind}','all')">All</button>
        ${all.map(v => `<button class="chip ${current === v ? "active" : ""}" onclick="setPickerFacet('${kind}','${v}')">${v}</button>`).join("")}
      </div>
    </div>`;
  document.getElementById("picker-filters").innerHTML =
    chipRow("Meal type", mealTypes, pickerMealType, "type") +
    chipRow("Cuisine", cuisines, pickerCuisine, "cuisine") +
    chipRow("Main ingredient", ingredients, pickerIngredient, "ingredient");

  const filtered = pool.filter(m =>
    (pickerMealType === "all" || SLOT_LABELS[m.category] === pickerMealType) &&
    (pickerCuisine === "all" || m.cuisine === pickerCuisine) &&
    (pickerIngredient === "all" || m.mainIngredient === pickerIngredient));

  let cardsHtml = filtered.map(m => `
    <button class="picker-card ${m.id === currentId ? "selected" : ""}" onclick="pickMeal(${pickerDayN}, '${pickerSlotK}', '${m.id}')">
      <div class="picker-card-top">
        <span class="picker-card-title">${m.title}${m.id === currentId ? " <span class='picker-current'>· current</span>" : ""}</span>
        <span class="kcal-pill tabular">~${m.kcal} kcal</span>
      </div>
      <div class="badges">
        <span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${SLOT_LABELS[m.category]}</span>
        <span class="badge" style="background:var(--primary-tint);color:var(--primary-deep);">${m.cuisine}</span>
        <span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${m.mainIngredient}</span>
        ${batchBadge(m.batch)}${favBadge(m)}${m.custom ? `<span class="badge own">Your recipe</span>` : ""}
      </div>
      ${m.hisAdd ? `<div class="picker-card-his">+ ${IS_PROFILE ? "optional carb side" : "carb side"}: ${m.hisAdd.text}</div>` : ""}
    </button>`).join("");
  if (!filtered.length) cardsHtml = `<p style="color:var(--ink-soft);padding:6px 2px;">No meals match those filters — try clearing one.</p>`;
  document.getElementById("picker-grid").innerHTML = cardsHtml;
}

function pickMeal(dayN, slotK, mealId) {
  const day = PLAN.find(d => d.n === dayN);
  const slot = day.slots.find(s => s.k === slotK);
  setMeal(day, slot, mealId);
  closePicker();
  renderAll();
  persist();
}

/* ---------------------------------------------------------
   RECIPES
--------------------------------------------------------- */
let recipeFilter = "all";
let recipeCuisine = "all";
let recipeIngredient = "all";
let recipeQuery = "";

function batchBadge(b) {
  return b === "batch" ? `<span class="badge batch">Batch &amp; freeze</span>` : `<span class="badge fresh">Cook fresh</span>`;
}

function renderRecipes() {
  const cats = [["all", "All"], ["breakfast", "Breakfasts"], ["brunch", "Brunches"], ["lunch", "Lunches"], ["dinner", "Dinners"]];
  const filterHtml = cats.map(([key, label]) =>
    `<button class="${recipeFilter === key ? "active" : ""}" onclick="setRecipeFilter('${key}')">${label}</button>`
  ).join("");
  document.getElementById("recipe-filters").innerHTML = filterHtml;

  const cuisines = uniqueFacet(POOL, "cuisine");
  const ingredients = uniqueFacet(POOL, "mainIngredient");
  const chip = (v, current, setter) => `<button class="chip ${current === v ? "active" : ""}" onclick="${setter}('${v}')">${v}</button>`;
  document.getElementById("recipe-cuisine-filters").innerHTML =
    `<button class="chip ${recipeCuisine === "all" ? "active" : ""}" onclick="setRecipeCuisine('all')">All cuisines</button>` +
    cuisines.map(v => chip(v, recipeCuisine, "setRecipeCuisine")).join("");
  document.getElementById("recipe-ingredient-filters").innerHTML =
    `<button class="chip ${recipeIngredient === "all" ? "active" : ""}" onclick="setRecipeIngredient('all')">All ingredients</button>` +
    ingredients.map(v => chip(v, recipeIngredient, "setRecipeIngredient")).join("");

  const q = recipeQuery.trim().toLowerCase();
  const list = POOL.filter(m => (recipeFilter === "all" || m.category === recipeFilter) &&
    (recipeCuisine === "all" || m.cuisine === recipeCuisine) &&
    (recipeIngredient === "all" || m.mainIngredient === recipeIngredient) &&
    (!q || m.title.toLowerCase().includes(q) || m.cuisine.toLowerCase().includes(q) || m.ingredients.some(i => i.text.toLowerCase().includes(q))));

  let html = "";
  if (!list.length) {
    html = `<p style="color:var(--ink-soft);">No recipes match that search.</p>`;
  }
  list.forEach(m => {
    html += `<div class="recipe" id="r-${m.id}">
      <div class="recipe-head">
        <div>
          <h3>${m.title}</h3>
          <div class="badges">${m.gf ? `<span class="badge gf">Gluten-free</span>` : ""}${batchBadge(m.batch)}${favBadge(m)}${m.custom ? `<span class="badge own">Your recipe</span>` : ""}<span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${SLOT_LABELS[m.category]}</span><span class="badge" style="background:var(--primary-tint);color:var(--primary-deep);">${m.cuisine}</span><span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${m.mainIngredient}</span></div>
        </div>
        <div class="kcal-pill tabular">~${m.kcal} kcal (your portion)${m.custom ? ` <button class="own-remove" onclick="removeCustomRecipe('${m.id}')">Remove</button>` : ""}</div>
      </div>
      <div class="recipe-cols">
        <div>
          <h4>Ingredients</h4>
          <ul>${m.ingredients.map(i => `<li class="ing"><span class="itext">${i.text}</span><a class="ocado-link" target="_blank" rel="noopener" href="${ocadoUrl(i.q)}">Ocado ↗</a></li>`).join("")}</ul>
          ${m.hisAdd ? `<div class="his-add"><b>${IS_PROFILE ? "Optional carb side:" : "To add a carb side:"}</b> ${m.hisAdd.text} <a class="ocado-link" style="margin-left:6px;" target="_blank" rel="noopener" href="${ocadoUrl(m.hisAdd.q)}">Ocado ↗</a></div>` : ""}
        </div>
        <div>
          <h4>Method</h4>
          <ol>${m.method.map(s => `<li class="method-step">${s}</li>`).join("")}</ol>
        </div>
      </div>
      <div class="tip"><b>Tastes better with:</b> ${m.tip}</div>
    </div>`;
  });
  document.getElementById("recipes-root").innerHTML = html;
}
function setRecipeFilter(key) { recipeFilter = key; renderRecipes(); }
function setRecipeCuisine(v) { recipeCuisine = v; renderRecipes(); }
function setRecipeIngredient(v) { recipeIngredient = v; renderRecipes(); }
function onRecipeSearch(el) { recipeQuery = el.value; renderRecipes(); }

/* ---------------------------------------------------------
   SHOPPING (auto-built from whichever meals are currently planned)
--------------------------------------------------------- */
let currentShopWeek = 1;
const SHOP_CAT_ORDER = [CATS.MEAT, CATS.FRIDGE, CATS.VEG, CATS.CUPBOARD, CATS.HIS];

function buildShoppingList(week) {
  const buckets = {};
  SHOP_CAT_ORDER.forEach(c => (buckets[c] = new Map())); // text -> {text, q}

  PLAN.filter(d => d.week === week).forEach(day => {
    day.slots.forEach(s => {
      const meal = mealById(currentMealId(day, s));
      meal.ingredients.forEach(ing => {
        if (!buckets[ing.cat].has(ing.text)) buckets[ing.cat].set(ing.text, ing);
      });
      if (meal.hisAdd) {
        const h = meal.hisAdd;
        if (!buckets[CATS.HIS].has(h.text)) buckets[CATS.HIS].set(h.text, h);
      }
    });
  });
  return buckets;
}

function renderShopping() {
  document.querySelectorAll(".shop-weeks button").forEach(b => b.classList.toggle("active", Number(b.dataset.week) === currentShopWeek));
  const buckets = buildShoppingList(currentShopWeek);
  let html = `<div class="shop-grid">`;
  SHOP_CAT_ORDER.forEach(cat => {
    const items = Array.from(buckets[cat].values());
    if (!items.length) return;
    html += `<div class="shop-cat"><h4>${cat}</h4>`;
    items.forEach(item => {
      const key = `shop:${currentShopWeek}:${cat}:${item.text}`;
      const on = isOn(key);
      html += `<div class="shop-item ${on ? "on" : ""}">
        <div class="check sm ${on ? "on" : ""}" data-key="${key}" onclick="toggleCheck('${key.replace(/'/g, "\\'")}')"></div>
        <span class="txt">${item.text}</span>
        <a class="ocado-link" target="_blank" rel="noopener" href="${ocadoUrl(item.q)}">Ocado ↗</a>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
  document.getElementById("shopping-root").innerHTML = html;
}
function setShopWeek(w) { currentShopWeek = w; renderShopping(); }

/* ---------------------------------------------------------
   PANTRY
--------------------------------------------------------- */
function renderPantry() {
  let html = "";
  PANTRY.forEach(p => {
    const key = `pantry:${p.name}`;
    const on = isOn(key);
    html += `<div class="pantry-item">
      <div class="check sm ${on ? "on" : ""}" data-key="${key}" onclick="toggleCheck('${key.replace(/'/g, "\\'")}')"></div>
      <div style="flex:1;">
        <div class="top">
          <div class="name" style="${on ? "color:var(--ink-faint);text-decoration:line-through;" : ""}">${p.name}</div>
          <a class="ocado-link" target="_blank" rel="noopener" href="${ocadoUrl(p.q)}">Ocado ↗</a>
        </div>
        <div class="note">${p.note}</div>
      </div>
    </div>`;
  });
  document.getElementById("pantry-root").innerHTML = html;
}

/* ---------------------------------------------------------
   PROFILE SETUP — the form shown on a personal link (?p=code)
   the first time, or reopened later to edit preferences
--------------------------------------------------------- */
let profileFormFav = { cuisines: [], ingredients: [] };

function openProfileSetup() {
  closeProfileSetup();
  const overlay = document.createElement("div");
  overlay.className = "picker-overlay";
  overlay.id = "profile-overlay";
  const p = PROFILE || {};
  profileFormFav = { cuisines: (p.favCuisines || []).slice(), ingredients: (p.favIngredients || []).slice() };
  const cuisineChips = uniqueFacet(MEALS, "cuisine").map(c =>
    `<button type="button" class="chip ${profileFormFav.cuisines.includes(c) ? "active" : ""}" onclick="toggleFav('cuisines','${c}')">${c}</button>`).join("");
  const ingredientChips = uniqueFacet(MEALS, "mainIngredient").map(c =>
    `<button type="button" class="chip ${profileFormFav.ingredients.includes(c) ? "active" : ""}" onclick="toggleFav('ingredients','${c}')">${c}</button>`).join("");
  const profileAllergens = p.allergens || [];
  const allergenChecks = ALLERGEN_OPTIONS.map(a =>
    `<label class="pf-allergen"><input type="checkbox" data-allergen="${a.key}" ${profileAllergens.includes(a.key) ? "checked" : ""}> ${a.label}</label>`).join("");
  overlay.innerHTML = `
    <div class="picker-panel profile-panel">
      <div class="picker-head"><h3>${p.name ? "Edit your preferences" : "Set up your own plan"}</h3>${p.name ? `<button class="picker-close" onclick="closeProfileSetup()" aria-label="Close">&times;</button>` : ""}</div>
      <div class="profile-form">
        ${p.name ? "" : `<p class="pf-intro">This link (<code>?p=${PROFILE_CODE}</code>) is yours alone — bookmark it and you'll see your own plan every time, filtered to your preferences below.</p>`}
        <label>Your name<input id="pf-name" type="text" value="${p.name || ""}" placeholder="e.g. Sarah"></label>
        <label>Daily calorie target<input id="pf-kcal" type="number" value="${p.calorieTarget || 1600}" min="800" max="4000"></label>
        <div class="pf-row">
          <label><input id="pf-veg" type="checkbox" ${p.vegetarian ? "checked" : ""}> Vegetarian</label>
          <label><input id="pf-df" type="checkbox" ${p.dairyFree ? "checked" : ""}> Dairy-free</label>
          <label><input id="pf-gf" type="checkbox" ${p.glutenFree ? "checked" : ""}> Gluten-free</label>
        </div>
        <label>Allergies &amp; intolerances to avoid <span class="pf-hint">(hides any dish that actually contains them)</span></label>
        <div class="pf-allergen-grid" id="pf-allergens">${allergenChecks}</div>
        <label>Favourite cuisines <span class="pf-hint">(highlighted with a ★, not required)</span></label>
        <div class="picker-chips" id="pf-cuisines">${cuisineChips}</div>
        <label>Favourite main ingredients</label>
        <div class="picker-chips" id="pf-ingredients">${ingredientChips}</div>
        <label>Anything else to avoid <span class="pf-hint">(comma-separated — hides any dish containing these words)</span>
          <input id="pf-avoid" type="text" value="${(p.avoid || []).join(", ")}" placeholder="e.g. mushroom, olives"></label>
        <button class="pf-save" onclick="saveProfileForm()">Save &amp; see my plan</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
function toggleFav(kind, value) {
  const list = profileFormFav[kind];
  const i = list.indexOf(value);
  if (i === -1) list.push(value); else list.splice(i, 1);
  document.getElementById(kind === "cuisines" ? "pf-cuisines" : "pf-ingredients")
    .querySelectorAll("button").forEach(b => b.classList.toggle("active", list.includes(b.textContent)));
}
function closeProfileSetup() {
  const o = document.getElementById("profile-overlay");
  if (o) o.remove();
}
function saveProfileForm() {
  const name = document.getElementById("pf-name").value.trim();
  const kcal = Number(document.getElementById("pf-kcal").value) || 1600;
  const veg = document.getElementById("pf-veg").checked;
  const df = document.getElementById("pf-df").checked;
  const gf = document.getElementById("pf-gf").checked;
  const allergens = Array.from(document.querySelectorAll("#pf-allergens [data-allergen]"))
    .filter(el => el.checked).map(el => el.dataset.allergen);
  const avoid = document.getElementById("pf-avoid").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  PROFILE = { name, calorieTarget: kcal, vegetarian: veg, dairyFree: df, glutenFree: gf, allergens, avoid, favCuisines: profileFormFav.cuisines.slice(), favIngredients: profileFormFav.ingredients.slice() };
  TARGET_KCAL = kcal;
  rebuildPool(); // re-filter the built-in pool to the new preferences, keeping any custom recipes
  PLAN = buildProfilePlan();
  persistProfile();
  closeProfileSetup();
  renderAll();
  applyProfileChrome();
}

/* ---------------------------------------------------------
   HOUSEHOLD SETUP FORM — "How many people, and what does each
   of you need?" Person 1 drives the shared plan's target and
   filters; everyone else adds a name, diet notes and an evening
   carb-side preference.
--------------------------------------------------------- */
let householdFormPeople = [];

function openHouseholdSetup() {
  closeHouseholdSetup();
  const overlay = document.createElement("div");
  overlay.className = "picker-overlay";
  overlay.id = "household-overlay";
  householdFormPeople = ((HOUSEHOLD.people && HOUSEHOLD.people.length) ? HOUSEHOLD.people : defaultHousehold().people)
    .map(p => Object.assign({ name: "", kcal: null, vegetarian: false, dairyFree: false, glutenFree: false, allergens: [], eveningCarbs: false, notes: "" }, p));
  document.body.appendChild(overlay);
  renderHouseholdForm(overlay);
}

function renderHouseholdForm(overlay) {
  const peopleHtml = householdFormPeople.map((p, i) => personFieldsHtml(p, i)).join("");
  overlay.innerHTML = `
    <div class="picker-panel profile-panel">
      <div class="picker-head"><h3>Household setup</h3><button class="picker-close" onclick="closeHouseholdSetup()" aria-label="Close">&times;</button></div>
      <div class="profile-form">
        <p class="pf-intro">Tell us who's eating and how their plates differ. The first person's calorie target and dietary filters drive which meals populate the plan below — since it's one shared dish per slot, only one set of hard filters can apply. Everyone else gets their own name, diet notes, and a say in whether they want a carb side with dinner.</p>
        <label>How many people?<input id="hh-count" type="number" min="1" max="6" value="${householdFormPeople.length}" onchange="setHouseholdCount(this.value)"></label>
        <div id="hh-people">${peopleHtml}</div>
        <button class="pf-save" onclick="saveHouseholdForm()">Save household setup</button>
      </div>
    </div>`;
}

function personFieldsHtml(p, i) {
  const isPrimary = i === 0;
  const allergenChecks = ALLERGEN_OPTIONS.map(a =>
    `<label class="pf-allergen"><input type="checkbox" data-hh-allergen="${i}:${a.key}" ${((p.allergens || []).includes(a.key)) ? "checked" : ""}> ${a.label}</label>`).join("");
  return `
    <div class="hh-person">
      <div class="hh-person-head">Person ${i + 1}${isPrimary ? " — drives the plan shown here" : ""}</div>
      <label>Name<input type="text" data-hh="name:${i}" value="${p.name || ""}" placeholder="${isPrimary ? "e.g. You" : "e.g. Partner"}"></label>
      <label>Daily calorie target ${isPrimary ? "" : `<span class="pf-hint">(optional, shown as a note only)</span>`}<input type="number" data-hh="kcal:${i}" value="${p.kcal || (isPrimary ? 1300 : "")}" min="800" max="4000"></label>
      <div class="pf-row">
        <label><input type="checkbox" data-hh="vegetarian:${i}" ${p.vegetarian ? "checked" : ""}> Vegetarian</label>
        <label><input type="checkbox" data-hh="dairyFree:${i}" ${p.dairyFree ? "checked" : ""}> Dairy-free</label>
        <label><input type="checkbox" data-hh="glutenFree:${i}" ${p.glutenFree ? "checked" : ""}> Gluten-free</label>
      </div>
      ${isPrimary ? `<label>Allergies &amp; intolerances to avoid</label><div class="pf-allergen-grid">${allergenChecks}</div>` : ""}
      <label class="pf-row"><input type="checkbox" data-hh="eveningCarbs:${i}" ${p.eveningCarbs ? "checked" : ""}> Wants a carb side with dinner</label>
      <label>Notes <span class="pf-hint">(optional — e.g. "butter is fine", or diet details for anyone but Person 1, since only theirs filters the shared plan)</span>
        <input type="text" data-hh="notes:${i}" value="${p.notes || ""}"></label>
    </div>`;
}

function collectHouseholdFormFromInputs() {
  document.querySelectorAll("#household-overlay [data-hh]").forEach(el => {
    const [field, idxStr] = el.dataset.hh.split(":");
    const idx = Number(idxStr);
    if (!householdFormPeople[idx]) return;
    if (el.type === "checkbox") householdFormPeople[idx][field] = el.checked;
    else if (el.type === "number") householdFormPeople[idx][field] = el.value === "" ? null : Number(el.value);
    else householdFormPeople[idx][field] = el.value;
  });
  document.querySelectorAll("#household-overlay [data-hh-allergen]").forEach(el => {
    const [idxStr, key] = el.dataset.hhAllergen.split(":");
    const idx = Number(idxStr);
    if (!householdFormPeople[idx]) return;
    const set = new Set(householdFormPeople[idx].allergens || []);
    if (el.checked) set.add(key); else set.delete(key);
    householdFormPeople[idx].allergens = Array.from(set);
  });
}

function setHouseholdCount(n) {
  collectHouseholdFormFromInputs();
  n = Math.max(1, Math.min(6, Number(n) || householdFormPeople.length));
  while (householdFormPeople.length < n) {
    householdFormPeople.push({ name: "", kcal: null, vegetarian: false, dairyFree: false, glutenFree: false, allergens: [], eveningCarbs: true, notes: "" });
  }
  householdFormPeople.length = n;
  const overlay = document.getElementById("household-overlay");
  if (overlay) renderHouseholdForm(overlay);
}

function closeHouseholdSetup() {
  const o = document.getElementById("household-overlay");
  if (o) o.remove();
}

function saveHouseholdForm() {
  collectHouseholdFormFromInputs();
  householdFormPeople.forEach((p, i) => { if (!p.name) p.name = i === 0 ? "You" : `Person ${i + 1}`; });
  HOUSEHOLD = { people: householdFormPeople.map(p => Object.assign({}, p)) };
  STATE.household = HOUSEHOLD;
  rebuildPool();
  PLAN = buildFilteredPlan(POOL);
  persist();
  closeHouseholdSetup();
  renderAll();
  applyHouseholdChrome();
}

function applyHouseholdChrome() {
  if (IS_PROFILE) return;
  const people = HOUSEHOLD.people || [];
  const primary = people[0] || { name: "You", kcal: 1300 };
  const others = people.slice(1);

  const target = document.getElementById("rule-target");
  if (target) target.innerHTML = `<b>~${TARGET_KCAL} kcal</b> for ${primary.name || "you"}, breakfast + lunch + dinner every day — swap in a brunch from the pool if you fancy one instead`;

  const evening = document.getElementById("rule-evening");
  if (evening) {
    evening.innerHTML = others.length
      ? `Same dinner, split at the plate — see who gets a carb side below`
      : `Fully yours — add a carb side to any dinner if you want one`;
  }

  const dietYou = document.getElementById("rule-diet-you");
  if (dietYou) {
    const bits = dietSummaryBits(primary);
    dietYou.innerHTML = `<b>${bits.length ? bits.join(" · ") : "No restrictions set"}</b>`;
  }

  const himCard = document.getElementById("rule-diet-him");
  const oldCard = himCard ? himCard.closest(".rule-card") : null;
  if (oldCard) oldCard.style.display = "none";

  let peopleBlock = document.getElementById("household-people");
  if (!peopleBlock) {
    peopleBlock = document.createElement("div");
    peopleBlock.id = "household-people";
    peopleBlock.className = "household-people";
    if (oldCard && oldCard.parentNode) oldCard.parentNode.insertBefore(peopleBlock, oldCard.nextSibling);
  }
  peopleBlock.innerHTML = others.length ? others.map(p => {
    const bits = dietSummaryBits(p);
    const carbNote = p.eveningCarbs ? "wants a carb side at dinner" : `no carb at dinner, same as ${primary.name || "you"}`;
    return `<div class="household-person"><b>${p.name || "Person"}</b><span>${bits.length ? bits.join(" · ") + " · " : ""}${carbNote}</span></div>`;
  }).join("") : "";
}

/* ---------------------------------------------------------
   MY RECIPES — add your own dish from the "My Recipes" tab.
   Stored in STATE.customMeals so it syncs like everything else,
   and folded into POOL by rebuildPool() so it shows up in the
   picker, Recipes tab and shopping list right alongside the
   built-in meals.
--------------------------------------------------------- */
function parseLines(text) {
  return text.split("\n").map(s => s.trim()).filter(Boolean);
}

function addCustomRecipe() {
  const title = document.getElementById("cr-title").value.trim();
  const category = document.getElementById("cr-category").value;
  const cuisine = document.getElementById("cr-cuisine").value.trim() || "Your recipes";
  const mainIngredient = document.getElementById("cr-ingredient").value.trim() || "Other";
  const kcal = Number(document.getElementById("cr-kcal").value) || 0;
  const batch = document.getElementById("cr-batch").value;
  const veg = document.getElementById("cr-veg").checked;
  const df = document.getElementById("cr-df").checked;
  const gf = document.getElementById("cr-gf").checked;
  const allergens = Array.from(document.querySelectorAll("#panel-myrecipes [data-allergen]"))
    .filter(el => el.checked).map(el => el.dataset.allergen);
  const ingLines = parseLines(document.getElementById("cr-ingredients-list").value);
  const methodLines = parseLines(document.getElementById("cr-method").value);
  const tip = document.getElementById("cr-tip").value.trim();
  const hisAddText = document.getElementById("cr-hisadd").value.trim();

  if (!title || !ingLines.length || !methodLines.length) {
    alert("Add at least a title, one ingredient (one per line) and one method step (one per line) before saving.");
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30);
  const id = "custom-" + (slug || "recipe") + "-" + Date.now().toString(36).slice(-4);

  const meal = {
    id, custom: true, category, title, kcal, batch,
    gf, vegetarian: veg, dairyFree: df, allergens,
    cuisine, mainIngredient,
    ingredients: ingLines.map(text => ({ text, cat: CATS.CUPBOARD, q: text })),
    method: methodLines,
    tip: tip || "It's your recipe — season and adjust it to taste."
  };
  if (category === "dinner" && hisAddText) {
    meal.hisAdd = { text: hisAddText, cat: CATS.HIS, q: hisAddText };
  }

  STATE.customMeals = STATE.customMeals || [];
  STATE.customMeals.push(meal);
  rebuildCustomIndex();
  rebuildPool();
  persist();
  renderAll();
  renderMyRecipesList();
  clearCustomRecipeForm();
}

function clearCustomRecipeForm() {
  ["cr-title", "cr-cuisine", "cr-ingredient", "cr-kcal", "cr-ingredients-list", "cr-method", "cr-tip", "cr-hisadd"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["cr-veg", "cr-df", "cr-gf"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  document.querySelectorAll("#panel-myrecipes [data-allergen]").forEach(el => (el.checked = false));
  const catEl = document.getElementById("cr-category");
  if (catEl) catEl.value = "dinner";
  const batchEl = document.getElementById("cr-batch");
  if (batchEl) batchEl.value = "fresh";
}

function removeCustomRecipe(id) {
  STATE.customMeals = (STATE.customMeals || []).filter(m => m.id !== id);
  // Any plan slot currently pointing at the removed recipe falls back to
  // its default meal instead of breaking.
  Object.keys(STATE.plan).forEach(key => {
    if (STATE.plan[key] === id) delete STATE.plan[key];
  });
  rebuildCustomIndex();
  rebuildPool();
  persist();
  renderAll();
  renderMyRecipesList();
}

function renderMyRecipesList() {
  const root = document.getElementById("my-recipes-list");
  if (!root) return;
  const list = STATE.customMeals || [];
  if (!list.length) {
    root.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px;">You haven't added any of your own recipes yet — use the form above. Once saved, it'll show up here, in the Recipes tab, and as an option in "Choose meal".</p>`;
    return;
  }
  root.innerHTML = list.map(m => `
    <div class="own-recipe-row">
      <div>
        <b>${m.title}</b>
        <span class="own-recipe-meta">${SLOT_LABELS[m.category]} · ${m.cuisine} · ~${m.kcal} kcal</span>
      </div>
      <button class="own-remove" onclick="removeCustomRecipe('${m.id}')">Remove</button>
    </div>`).join("");
}

function applyProfileChrome() {
  if (!IS_PROFILE || !PROFILE) return;
  document.title = `${PROFILE.name ? PROFILE.name + "'s" : "Your"} plan — Two Plates, One Table`;
  const eyebrow = document.querySelector("header .eyebrow");
  const h1 = document.querySelector("header h1");
  const lede = document.querySelector("header .lede");
  if (eyebrow) eyebrow.textContent = "Your own personalised plan";
  if (h1) h1.textContent = PROFILE.name ? `${PROFILE.name}'s Plan` : "Your Plan";
  if (lede) lede.textContent = "Pick meals from your filtered pool below — favourites are starred, the shopping list rebuilds itself as you go.";
  const target = document.getElementById("rule-target");
  if (target) target.innerHTML = `<b>~${TARGET_KCAL} kcal</b> target, breakfast + lunch + dinner every day`;
  const evening = document.getElementById("rule-evening");
  if (evening) evening.innerHTML = `Fully yours — add an optional carb side to any dinner if you want one`;
  const dietYou = document.getElementById("rule-diet-you");
  if (dietYou) {
    const bits = dietSummaryBits(PROFILE);
    dietYou.innerHTML = `<b>${bits.length ? bits.join(" · ") : "No restrictions set"}</b>`;
  }
  const himCard = document.getElementById("rule-diet-him");
  if (himCard) { const card = himCard.closest(".rule-card"); if (card) card.style.display = "none"; }
  const note = document.getElementById("sync-note");
  if (note) {
    const link = `${location.origin}${location.pathname}?p=${PROFILE_CODE}`;
    note.insertAdjacentHTML("afterend",
      `<div class="profile-link">Your personal link — bookmark it to see this plan again: <code>${link}</code>
        <button onclick="openProfileSetup()">Edit preferences</button></div>`);
  }
}

/* ---------------------------------------------------------
   NAV + BOOT
--------------------------------------------------------- */
function switchTab(name) {
  document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function goRecipe(e, id) {
  e.preventDefault();
  switchTab("recipes");
  setTimeout(() => {
    const el = document.getElementById("r-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : current === "light" ? null : "dark";
  if (next) root.setAttribute("data-theme", next);
  else root.removeAttribute("data-theme");
  try { localStorage.setItem("twoPlatesTheme", next || ""); } catch (e) {}
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = next === "dark" ? "🌙 Dark" : next === "light" ? "☀️ Light" : "🖥 Auto";
}
function bootTheme() {
  let saved = "";
  try { saved = localStorage.getItem("twoPlatesTheme") || ""; } catch (e) {}
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = saved === "dark" ? "🌙 Dark" : saved === "light" ? "☀️ Light" : "🖥 Auto";
}

function renderAll() {
  renderPlan();
  renderRecipes();
  renderShopping();
  renderPantry();
}

async function boot() {
  bootTheme();
  document.getElementById("tabs").addEventListener("click", e => {
    const btn = e.target.closest("button[data-tab]");
    if (btn) switchTab(btn.dataset.tab);
  });
  document.getElementById("shop-week-tabs").addEventListener("click", e => {
    const btn = e.target.closest("button[data-week]");
    if (btn) setShopWeek(Number(btn.dataset.week));
  });

  const hhBtn = document.getElementById("household-setup-btn");

  if (IS_PROFILE) {
    if (hhBtn) hhBtn.style.display = "none";
    await bootProfile();
    return;
  }
  if (hhBtn) hhBtn.addEventListener("click", openHouseholdSetup);

  STATE = Object.assign({ plan: {}, checks: {}, customMeals: [] }, SYNC.loadLocal());
  HOUSEHOLD = (STATE.household && STATE.household.people && STATE.household.people.length) ? STATE.household : defaultHousehold();
  rebuildCustomIndex();
  rebuildPool();
  PLAN = buildFilteredPlan(POOL);
  renderAll();
  renderMyRecipesList();
  applyHouseholdChrome();

  const note = document.getElementById("sync-note");
  if (SYNC.isConfigured()) {
    note.textContent = "Syncing with your shared planner…";
    const remote = await SYNC.loadRemote();
    if (remote) {
      STATE = Object.assign({ plan: {}, checks: {}, customMeals: [] }, remote);
      HOUSEHOLD = (STATE.household && STATE.household.people && STATE.household.people.length) ? STATE.household : defaultHousehold();
      rebuildCustomIndex();
      rebuildPool();
      PLAN = buildFilteredPlan(POOL);
      renderAll();
      renderMyRecipesList();
      applyHouseholdChrome();
      note.textContent = "Synced ✓ — you and your partner see the same plan.";
    } else {
      note.textContent = "Couldn't reach the shared planner just now — showing this device's copy.";
      note.classList.add("warn");
    }
  } else {
    note.textContent = "Not synced yet — see README.md to turn on a free sync so both of you see the same plan.";
    note.classList.add("warn");
  }
}

async function bootProfile() {
  PROFILE = loadProfileLocal();
  STATE = Object.assign({ plan: {}, checks: {}, customMeals: [] }, loadProfileLocalState() || {});
  const note = document.getElementById("sync-note");

  if (SYNC.isConfigured()) {
    const [remoteSettings, remoteState] = await Promise.all([
      SYNC.loadPath(`profiles/${PROFILE_CODE}/settings`),
      SYNC.loadPath(`profiles/${PROFILE_CODE}/state`)
    ]);
    if (remoteSettings) PROFILE = remoteSettings;
    if (remoteState) STATE = Object.assign({ plan: {}, checks: {}, customMeals: [] }, remoteState);
  }

  rebuildCustomIndex();

  if (!PROFILE) {
    TARGET_KCAL = 1600;
    rebuildPool();
    PLAN = buildProfilePlan();
    renderAll();
    renderMyRecipesList();
    note.textContent = "";
    openProfileSetup();
    return;
  }

  TARGET_KCAL = PROFILE.calorieTarget || 1600;
  rebuildPool();
  PLAN = buildProfilePlan();
  renderAll();
  renderMyRecipesList();
  applyProfileChrome();
  note.textContent = SYNC.isConfigured()
    ? "Synced ✓ — this link remembers your plan on any device you open it on."
    : "Saved to this device only for now — see README.md to turn on syncing across devices.";
  if (!SYNC.isConfigured()) note.classList.add("warn");
}

document.addEventListener("DOMContentLoaded", boot);
