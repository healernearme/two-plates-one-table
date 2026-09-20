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
   PROFILES — a personal link (?p=code) gives someone their own
   filtered pool, calorie target and plan, synced separately from
   the shared household plan below (which stays exactly as before
   when there's no ?p= in the URL).
--------------------------------------------------------- */
const URL_PARAMS = new URLSearchParams(location.search);
const PROFILE_CODE = (URL_PARAMS.get("p") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
const IS_PROFILE = !!PROFILE_CODE;

let PROFILE = null; // { name, calorieTarget, vegetarian, dairyFree, avoid: [], favCuisines: [], favIngredients: [] }
let PLAN = DEFAULT_PLAN; // the 14-day skeleton actually rendered — swapped for a profile's own on boot
let POOL = MEALS;         // the meal pool actually offered — filtered per-profile on boot
let TARGET_KCAL = 1300;

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
function buildProfilePlan() {
  return DEFAULT_PLAN.map(day => ({
    n: day.n, week: day.week, weekday: day.weekday,
    slots: day.slots.map(s => {
      const def = POOL.find(m => m.category === s.k) || MEALS.find(m => m.category === s.k);
      return { k: s.k, id: def.id };
    })
  }));
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
  return day.slots.reduce((sum, s) => sum + (MEALS_BY_ID[currentMealId(day, s)].kcal || 0), 0);
}

function renderPlan() {
  let html = "";
  [1, 2].forEach(w => {
    html += `<div class="week-heading"><h2>Week ${w}</h2><span>shift the whole plan to whichever week suits you</span></div>`;
    PLAN.filter(d => d.week === w).forEach(day => {
      const total = dayTotal(day);
      const overTarget = IS_PROFILE && total > TARGET_KCAL + 50;
      html += `<div class="day-card"><div class="day-card-head"><h3>${day.weekday}</h3><span class="day-total tabular ${overTarget ? "over" : ""}">~${total} kcal${IS_PROFILE ? ` / ${TARGET_KCAL}` : ""}</span></div>`;
      day.slots.forEach(s => {
        const mealId = currentMealId(day, s);
        const meal = MEALS_BY_ID[mealId];
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
            ${meal.hisAdd ? `<div class="his-line">+ for him: <b>${meal.hisAdd.text}</b></div>` : ""}
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
        ${batchBadge(m.batch)}${favBadge(m)}
      </div>
      ${m.hisAdd ? `<div class="picker-card-his">+ ${IS_PROFILE ? "optional carb side" : "for him"}: ${m.hisAdd.text}</div>` : ""}
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
          <div class="badges"><span class="badge gf">Gluten-free</span>${batchBadge(m.batch)}${favBadge(m)}<span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${SLOT_LABELS[m.category]}</span><span class="badge" style="background:var(--primary-tint);color:var(--primary-deep);">${m.cuisine}</span><span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${m.mainIngredient}</span></div>
        </div>
        <div class="kcal-pill tabular">~${m.kcal} kcal (your portion)</div>
      </div>
      <div class="recipe-cols">
        <div>
          <h4>Ingredients</h4>
          <ul>${m.ingredients.map(i => `<li class="ing"><span class="itext">${i.text}</span><a class="ocado-link" target="_blank" rel="noopener" href="${ocadoUrl(i.q)}">Ocado ↗</a></li>`).join("")}</ul>
          ${m.hisAdd ? `<div class="his-add"><b>${IS_PROFILE ? "Optional carb side:" : "For his plate, add:"}</b> ${m.hisAdd.text} <a class="ocado-link" style="margin-left:6px;" target="_blank" rel="noopener" href="${ocadoUrl(m.hisAdd.q)}">Ocado ↗</a></div>` : ""}
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
      const meal = MEALS_BY_ID[currentMealId(day, s)];
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
        </div>
        <label>Favourite cuisines <span class="pf-hint">(highlighted with a ★, not required)</span></label>
        <div class="picker-chips" id="pf-cuisines">${cuisineChips}</div>
        <label>Favourite main ingredients</label>
        <div class="picker-chips" id="pf-ingredients">${ingredientChips}</div>
        <label>Ingredients to avoid <span class="pf-hint">(comma-separated — hides any dish containing these)</span>
          <input id="pf-avoid" type="text" value="${(p.avoid || []).join(", ")}" placeholder="e.g. mushroom, prawns, olives"></label>
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
  const avoid = document.getElementById("pf-avoid").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  PROFILE = { name, calorieTarget: kcal, vegetarian: veg, dairyFree: df, avoid, favCuisines: profileFormFav.cuisines.slice(), favIngredients: profileFormFav.ingredients.slice() };
  TARGET_KCAL = kcal;
  POOL = MEALS.filter(passesFilters);
  if (!POOL.length) POOL = MEALS; // never let an over-strict filter empty the whole pool
  PLAN = buildProfilePlan();
  persistProfile();
  closeProfileSetup();
  renderAll();
  applyProfileChrome();
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
    const bits = ["Whole pool is gluten-free"];
    if (PROFILE.vegetarian) bits.push("vegetarian only");
    if (PROFILE.dairyFree) bits.push("dairy-free only");
    if (PROFILE.avoid && PROFILE.avoid.length) bits.push(`avoiding ${PROFILE.avoid.join(", ")}`);
    dietYou.innerHTML = `<b>${bits.join(" · ")}</b>`;
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

  if (IS_PROFILE) {
    await bootProfile();
    return;
  }

  STATE = Object.assign({ plan: {}, checks: {} }, SYNC.loadLocal());
  renderAll();

  const note = document.getElementById("sync-note");
  if (SYNC.isConfigured()) {
    note.textContent = "Syncing with your shared planner…";
    const remote = await SYNC.loadRemote();
    if (remote) {
      STATE = Object.assign({ plan: {}, checks: {} }, remote);
      renderAll();
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
  STATE = Object.assign({ plan: {}, checks: {} }, loadProfileLocalState() || {});
  const note = document.getElementById("sync-note");

  if (SYNC.isConfigured()) {
    const [remoteSettings, remoteState] = await Promise.all([
      SYNC.loadPath(`profiles/${PROFILE_CODE}/settings`),
      SYNC.loadPath(`profiles/${PROFILE_CODE}/state`)
    ]);
    if (remoteSettings) PROFILE = remoteSettings;
    if (remoteState) STATE = Object.assign({ plan: {}, checks: {} }, remoteState);
  }

  if (!PROFILE) {
    TARGET_KCAL = 1600;
    POOL = MEALS;
    PLAN = buildProfilePlan();
    renderAll();
    note.textContent = "";
    openProfileSetup();
    return;
  }

  TARGET_KCAL = PROFILE.calorieTarget || 1600;
  POOL = MEALS.filter(passesFilters);
  if (!POOL.length) POOL = MEALS;
  PLAN = buildProfilePlan();
  renderAll();
  applyProfileChrome();
  note.textContent = SYNC.isConfigured()
    ? "Synced ✓ — this link remembers your plan on any device you open it on."
    : "Saved to this device only for now — see README.md to turn on syncing across devices.";
  if (!SYNC.isConfigured()) note.classList.add("warn");
}

document.addEventListener("DOMContentLoaded", boot);
