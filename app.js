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

function persist() {
  SYNC.save(STATE);
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
    DEFAULT_PLAN.filter(d => d.week === w).forEach(day => {
      const total = dayTotal(day);
      html += `<div class="day-card"><div class="day-card-head"><h3>${day.weekday}</h3><span class="day-total tabular">~${total} kcal</span></div>`;
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
let pickerCuisine = "all";
let pickerIngredient = "all";

function openPicker(dayN, slotK) {
  pickerDayN = dayN;
  pickerSlotK = slotK;
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
  if (kind === "cuisine") pickerCuisine = value;
  else pickerIngredient = value;
  renderPicker();
}

function renderPicker() {
  if (pickerDayN === null) return;
  const day = DEFAULT_PLAN.find(d => d.n === pickerDayN);
  const slot = day.slots.find(s => s.k === pickerSlotK);
  const currentId = currentMealId(day, slot);
  const pool = mealsOfCategory(pickerSlotK);

  document.getElementById("picker-title").textContent = `Choose ${SLOT_LABELS[pickerSlotK].toLowerCase()} for ${day.weekday}`;

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
    chipRow("Cuisine", cuisines, pickerCuisine, "cuisine") +
    chipRow("Main ingredient", ingredients, pickerIngredient, "ingredient");

  const filtered = pool.filter(m =>
    (pickerCuisine === "all" || m.cuisine === pickerCuisine) &&
    (pickerIngredient === "all" || m.mainIngredient === pickerIngredient));

  let cardsHtml = filtered.map(m => `
    <button class="picker-card ${m.id === currentId ? "selected" : ""}" onclick="pickMeal(${pickerDayN}, '${pickerSlotK}', '${m.id}')">
      <div class="picker-card-top">
        <span class="picker-card-title">${m.title}${m.id === currentId ? " <span class='picker-current'>· current</span>" : ""}</span>
        <span class="kcal-pill tabular">~${m.kcal} kcal</span>
      </div>
      <div class="badges">
        <span class="badge" style="background:var(--primary-tint);color:var(--primary-deep);">${m.cuisine}</span>
        <span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${m.mainIngredient}</span>
        ${batchBadge(m.batch)}
      </div>
      ${m.hisAdd ? `<div class="picker-card-his">+ for him: ${m.hisAdd.text}</div>` : ""}
    </button>`).join("");
  if (!filtered.length) cardsHtml = `<p style="color:var(--ink-soft);padding:6px 2px;">No meals match those filters — try clearing one.</p>`;
  document.getElementById("picker-grid").innerHTML = cardsHtml;
}

function pickMeal(dayN, slotK, mealId) {
  const day = DEFAULT_PLAN.find(d => d.n === dayN);
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

  const cuisines = uniqueFacet(MEALS, "cuisine");
  const ingredients = uniqueFacet(MEALS, "mainIngredient");
  const chip = (v, current, setter) => `<button class="chip ${current === v ? "active" : ""}" onclick="${setter}('${v}')">${v}</button>`;
  document.getElementById("recipe-cuisine-filters").innerHTML =
    `<button class="chip ${recipeCuisine === "all" ? "active" : ""}" onclick="setRecipeCuisine('all')">All cuisines</button>` +
    cuisines.map(v => chip(v, recipeCuisine, "setRecipeCuisine")).join("");
  document.getElementById("recipe-ingredient-filters").innerHTML =
    `<button class="chip ${recipeIngredient === "all" ? "active" : ""}" onclick="setRecipeIngredient('all')">All ingredients</button>` +
    ingredients.map(v => chip(v, recipeIngredient, "setRecipeIngredient")).join("");

  const q = recipeQuery.trim().toLowerCase();
  const list = MEALS.filter(m => (recipeFilter === "all" || m.category === recipeFilter) &&
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
          <div class="badges"><span class="badge gf">Gluten-free</span>${batchBadge(m.batch)}<span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${SLOT_LABELS[m.category]}</span><span class="badge" style="background:var(--primary-tint);color:var(--primary-deep);">${m.cuisine}</span><span class="badge" style="background:var(--surface-2);color:var(--ink-soft);">${m.mainIngredient}</span></div>
        </div>
        <div class="kcal-pill tabular">~${m.kcal} kcal (your portion)</div>
      </div>
      <div class="recipe-cols">
        <div>
          <h4>Ingredients</h4>
          <ul>${m.ingredients.map(i => `<li class="ing"><span class="itext">${i.text}</span><a class="ocado-link" target="_blank" rel="noopener" href="${ocadoUrl(i.q)}">Ocado ↗</a></li>`).join("")}</ul>
          ${m.hisAdd ? `<div class="his-add"><b>For his plate, add:</b> ${m.hisAdd.text} <a class="ocado-link" style="margin-left:6px;" target="_blank" rel="noopener" href="${ocadoUrl(m.hisAdd.q)}">Ocado ↗</a></div>` : ""}
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

  DEFAULT_PLAN.filter(d => d.week === week).forEach(day => {
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
    note.textContent = "Not synced yet — see README.md to connect a free Google Sheet so both of you see the same plan.";
    note.classList.add("warn");
  }
}

document.addEventListener("DOMContentLoaded", boot);
