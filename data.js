/* ==========================================================================
   Two Plates, One Table — meal pool data
   Add a new meal any time by copying an existing object into MEALS below.
   category: "breakfast" | "brunch" | "lunch" | "dinner" — which slot it can fill
   cuisine: a broad flavour family, used as a browse/filter facet
   mainIngredient: the headline ingredient, used as a second browse/filter facet
   vegetarian / dairyFree: used to filter personal profile links (?p=code)
   Each ingredient: { text: "shown in the recipe", cat: shopping category, q: short Ocado search term }
   Dinners carry hisAdd: { text, cat, q } for the partner's carb side.
   ========================================================================== */

const CATS = {
  MEAT: "Meat, fish & eggs",
  FRIDGE: "Fridge",
  VEG: "Fruit & veg",
  CUPBOARD: "Store cupboard",
  HIS: "For his plate"
};

const MEALS = [
  // ---------- BREAKFASTS ----------
  {
    id: "bf1", category: "breakfast", title: "Greek yogurt, berries & chia", kcal: 320, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Everyday", mainIngredient: "Vegetarian",
    ingredients: [
      { text: "200g 0% or 2% Greek yogurt", cat: CATS.FRIDGE, q: "Greek yogurt" },
      { text: "100g mixed berries (fresh or frozen, defrosted)", cat: CATS.VEG, q: "mixed berries" },
      { text: "1 tbsp chia seeds", cat: CATS.CUPBOARD, q: "chia seeds" },
      { text: "15g flaked almonds", cat: CATS.CUPBOARD, q: "flaked almonds" },
      { text: "optional: 1/2 tsp cinnamon", cat: CATS.CUPBOARD, q: "ground cinnamon" }
    ],
    method: [
      "Stir the chia seeds through the yogurt and leave 5 minutes to thicken slightly.",
      "Top with the berries and almonds.",
      "Dust with cinnamon if using."
    ],
    tip: "A few drops of vanilla extract or a curl of lemon zest makes this taste far less like a diet breakfast."
  },
  {
    id: "bf2", category: "breakfast", title: "Veggie omelette with spinach & tomato", kcal: 310, batch: "fresh", gf: true, vegetarian: true, dairyFree: true,
    cuisine: "Everyday", mainIngredient: "Eggs",
    ingredients: [
      { text: "2 eggs", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "handful spinach", cat: CATS.VEG, q: "spinach" },
      { text: "1 small tomato, diced", cat: CATS.VEG, q: "tomato" },
      { text: "2 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 small orange or handful grapes, to finish", cat: CATS.VEG, q: "orange" }
    ],
    method: [
      "Whisk the eggs with a pinch of salt and pepper.",
      "Warm the oil in a small non-stick pan, wilt the spinach for 30 seconds, add the tomato.",
      "Pour in the eggs, tilt the pan to cover the base, and cook gently until just set. Fold in half to serve.",
      "Have the fruit alongside."
    ],
    tip: "A pinch of dried oregano in the egg mix and a few shavings of hard cheese (for you) turn this Mediterranean instead of plain."
  },
  {
    id: "bf3", category: "breakfast", title: "Gluten-free overnight oats with berries", kcal: 315, batch: "batch", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Everyday", mainIngredient: "Vegetarian",
    ingredients: [
      { text: "45g certified gluten-free oats", cat: CATS.CUPBOARD, q: "gluten free oats" },
      { text: "150ml semi-skimmed milk (or a milk of your choice)", cat: CATS.FRIDGE, q: "semi skimmed milk" },
      { text: "100g mixed berries", cat: CATS.VEG, q: "mixed berries" },
      { text: "1 tsp honey", cat: CATS.CUPBOARD, q: "honey" },
      { text: "1/2 tsp cinnamon", cat: CATS.CUPBOARD, q: "ground cinnamon" }
    ],
    method: [
      "The night before, stir the oats, milk and cinnamon together in a jar or bowl.",
      "Cover and refrigerate overnight.",
      "In the morning, top with berries and a drizzle of honey."
    ],
    tip: "Make three or four jars at once on a Sunday — they keep well for up to 4 days and mean zero effort on weekday mornings."
  },
  {
    id: "bf4", category: "breakfast", title: "Cottage cheese with fruit & walnuts", kcal: 310, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Everyday", mainIngredient: "Vegetarian",
    ingredients: [
      { text: "200g cottage cheese", cat: CATS.FRIDGE, q: "cottage cheese" },
      { text: "120g peach, pineapple or nectarine, sliced", cat: CATS.VEG, q: "peach" },
      { text: "12g walnuts, roughly chopped", cat: CATS.CUPBOARD, q: "walnuts" },
      { text: "1 tsp honey", cat: CATS.CUPBOARD, q: "honey" }
    ],
    method: [
      "Spoon the cottage cheese into a bowl.",
      "Top with the fruit and walnuts.",
      "Finish with a thin drizzle of honey."
    ],
    tip: "A little lemon zest and cracked black pepper over the cottage cheese is an unexpectedly good, savoury-leaning twist."
  },

  // ---------- BRUNCHES ----------
  {
    id: "br1", category: "brunch", title: "Eggs, baked beans & grilled tomato", kcal: 730, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "British", mainIngredient: "Eggs",
    ingredients: [
      { text: "2 eggs, fried or poached", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "250g reduced-sugar, reduced-salt baked beans (check label — most major brands are gluten-free, but confirm)", cat: CATS.CUPBOARD, q: "reduced sugar baked beans" },
      { text: "1 large tomato, halved and grilled", cat: CATS.VEG, q: "tomato" },
      { text: "handful spinach, wilted", cat: CATS.VEG, q: "spinach" },
      { text: "2 slices gluten-free bread, toasted", cat: CATS.CUPBOARD, q: "gluten free bread" },
      { text: "1 tsp butter", cat: CATS.FRIDGE, q: "butter" },
      { text: "1/4 avocado, sliced", cat: CATS.VEG, q: "avocado" }
    ],
    method: [
      "Warm the beans in a small pan while you grill the tomato halves and toast the bread.",
      "Wilt the spinach in the same pan you'll fry the eggs in, then push aside and fry or poach the eggs.",
      "Butter the toast and plate everything together with the avocado."
    ],
    tip: "A few shakes of Worcestershire-style sauce (check GF) or a swirl of chilli oil on the side — not mixed through your beans if you want to keep them mild — lifts this a lot."
  },
  {
    id: "br2", category: "brunch", title: "Smoked salmon, poached egg & avocado", kcal: 750, batch: "fresh", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "British", mainIngredient: "Fish",
    ingredients: [
      { text: "100g smoked salmon", cat: CATS.MEAT, q: "smoked salmon" },
      { text: "2 eggs, poached", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "1/2 avocado, mashed with lemon and black pepper", cat: CATS.VEG, q: "avocado" },
      { text: "2–3 slices gluten-free bread or sourdough-style GF loaf, toasted", cat: CATS.CUPBOARD, q: "gluten free bread" },
      { text: "1 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "small handful rocket, dressed with lemon", cat: CATS.VEG, q: "rocket salad" }
    ],
    method: [
      "Toast the bread and spread with the mashed avocado.",
      "Poach the eggs (a splash of vinegar in just-simmering water helps them hold together).",
      "Layer the smoked salmon over the avocado toast, top with the poached eggs, and serve the dressed rocket alongside."
    ],
    tip: "A scattering of fresh dill makes this taste like a weekend hotel brunch rather than a meal-prep plate."
  },
  {
    id: "br3", category: "brunch", title: "Mediterranean baked eggs (mild)", kcal: 720, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Mediterranean", mainIngredient: "Eggs",
    ingredients: [
      { text: "2 eggs", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "250g passata or chopped tomatoes", cat: CATS.CUPBOARD, q: "passata" },
      { text: "1/2 courgette, diced", cat: CATS.VEG, q: "courgette" },
      { text: "1/4 onion, sliced", cat: CATS.VEG, q: "onion" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "1/2 tsp mild smoked paprika (not hot)", cat: CATS.CUPBOARD, q: "smoked paprika" },
      { text: "1/2 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "30g feta, crumbled", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "3 slices gluten-free crusty bread", cat: CATS.CUPBOARD, q: "gluten free bread" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" }
    ],
    method: [
      "Soften the onion and courgette in the olive oil for 5–6 minutes. Add the garlic, paprika and oregano and cook 1 minute more.",
      "Pour in the passata, season, and simmer 5 minutes until slightly thickened.",
      "Make two wells in the sauce, crack in the eggs, cover, and cook gently until the whites are set but yolks still soft (5–7 minutes).",
      "Scatter with feta and serve with the toasted GF bread for scooping."
    ],
    tip: "This is a shakshuka built mild on purpose — keep a small jar of chilli flakes on the table so anyone who wants heat can add their own."
  },
  {
    id: "br4", category: "brunch", title: "Turkish-style breakfast plate", kcal: 720, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Turkish", mainIngredient: "Eggs",
    ingredients: [
      { text: "2 eggs, soft-boiled or fried", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "40g feta, sliced", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "1/2 cucumber, sliced", cat: CATS.VEG, q: "cucumber" },
      { text: "1 tomato, wedged", cat: CATS.VEG, q: "tomato" },
      { text: "6 Kalamata olives", cat: CATS.CUPBOARD, q: "kalamata olives" },
      { text: "3 slices gluten-free bread", cat: CATS.CUPBOARD, q: "gluten free bread" },
      { text: "15g walnuts", cat: CATS.CUPBOARD, q: "walnuts" },
      { text: "1 tsp honey", cat: CATS.CUPBOARD, q: "honey" },
      { text: "1 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" }
    ],
    method: [
      "Soft-boil the eggs for 6–7 minutes, or fry them if you prefer.",
      "Arrange the feta, cucumber, tomato and olives on a plate — this is a spread, not a cooked dish.",
      "Toast the bread, drizzle with olive oil, and serve the walnuts and honey alongside for dipping."
    ],
    tip: "Good olive oil and flaky salt do most of the work here — don't skimp on either."
  },

  // ---------- LUNCHES ----------
  {
    id: "l1", category: "lunch", title: "Baked lemon salmon, sweet potato & greens", kcal: 450, batch: "batch", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "Mediterranean", mainIngredient: "Fish",
    ingredients: [
      { text: "130g salmon fillet", cat: CATS.MEAT, q: "salmon fillet" },
      { text: "160g sweet potato, cut into small cubes", cat: CATS.VEG, q: "sweet potato" },
      { text: "100g tenderstem broccoli or green beans", cat: CATS.VEG, q: "tenderstem broccoli" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1/2 lemon, juiced and zested", cat: CATS.VEG, q: "lemon" },
      { text: "1 tsp dried dill (or fresh if you have it)", cat: CATS.CUPBOARD, q: "dried dill" },
      { text: "2 tbsp natural yogurt, mixed with a little lemon and dill, to serve", cat: CATS.FRIDGE, q: "natural yogurt" }
    ],
    method: [
      "Heat the oven to 200°C (fan 180°C). Toss the sweet potato cubes in half the oil, season, and roast 20 minutes.",
      "Add the salmon fillet and broccoli to the tray, drizzle with the remaining oil and lemon juice, and roast a further 12–14 minutes until the salmon flakes easily.",
      "Serve with the lemon zest scattered over and the dill yogurt on the side."
    ],
    tip: "The one non-negotiable of the plan — this is the salmon-and-sweet-potato lunch. Roast a double batch and split it across two lunches; the sweet potato reheats better than you'd expect."
  },
  {
    id: "l2", category: "lunch", title: "Greek-style chicken & chickpea salad", kcal: 470, batch: "batch", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "Greek", mainIngredient: "Chicken",
    ingredients: [
      { text: "120g chicken breast", cat: CATS.MEAT, q: "chicken breast" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1/2 lemon, juiced", cat: CATS.VEG, q: "lemon" },
      { text: "1/2 cucumber, diced", cat: CATS.VEG, q: "cucumber" },
      { text: "1 tomato, diced", cat: CATS.VEG, q: "tomato" },
      { text: "1/4 red onion, thinly sliced", cat: CATS.VEG, q: "red onion" },
      { text: "40g chickpeas, drained", cat: CATS.CUPBOARD, q: "chickpeas" },
      { text: "6 Kalamata olives", cat: CATS.CUPBOARD, q: "kalamata olives" },
      { text: "25g feta, crumbled", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "2 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" }
    ],
    method: [
      "Marinate the chicken in half the lemon juice, the oregano, a little salt and 1 tsp of the oil for at least 15 minutes (longer if you have time).",
      "Griddle or pan-fry the chicken 5–6 minutes each side until cooked through, then slice.",
      "Toss the cucumber, tomato, onion, chickpeas and olives with the remaining lemon juice and oil.",
      "Top the salad with the sliced chicken and crumbled feta."
    ],
    tip: "Grill 3–4 chicken breasts at once and keep them sliced in the fridge — this salad comes together in under 10 minutes when the chicken's already done."
  },
  {
    id: "l3", category: "lunch", title: "Tuna & white bean salad", kcal: 430, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Mediterranean", mainIngredient: "Fish",
    ingredients: [
      { text: "145g tin tuna in spring water, drained", cat: CATS.CUPBOARD, q: "tuna in spring water" },
      { text: "120g cannellini beans, drained and rinsed", cat: CATS.CUPBOARD, q: "cannellini beans" },
      { text: "40g jarred artichoke hearts, roughly chopped", cat: CATS.CUPBOARD, q: "artichoke hearts" },
      { text: "6 cherry tomatoes, halved", cat: CATS.VEG, q: "cherry tomatoes" },
      { text: "1/4 cucumber, diced", cat: CATS.VEG, q: "cucumber" },
      { text: "6 Kalamata olives, halved", cat: CATS.CUPBOARD, q: "kalamata olives" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 tsp red wine vinegar", cat: CATS.CUPBOARD, q: "red wine vinegar" },
      { text: "small handful fresh parsley, chopped", cat: CATS.VEG, q: "fresh parsley" }
    ],
    method: [
      "Flake the tuna into a bowl with the beans, artichoke hearts, tomatoes and cucumber.",
      "Whisk the oil and vinegar together and toss through with the olives.",
      "Finish with the parsley."
    ],
    tip: "This one needs no cooking at all — make two portions in one go and it keeps in the fridge for up to 3 days, so it's the easiest lunch on the whole plan."
  },
  {
    id: "l4", category: "lunch", title: "Mediterranean spinach & feta frittata", kcal: 455, batch: "batch", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Mediterranean", mainIngredient: "Eggs",
    ingredients: [
      { text: "3 eggs", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "handful spinach, roughly chopped", cat: CATS.VEG, q: "spinach" },
      { text: "20g sun-dried tomatoes, chopped", cat: CATS.CUPBOARD, q: "sun-dried tomatoes" },
      { text: "25g feta, crumbled", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "1 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "30g chickpeas, for the side salad", cat: CATS.CUPBOARD, q: "chickpeas" },
      { text: "small handful mixed leaves, dressed with 1 tsp olive oil and lemon", cat: CATS.VEG, q: "mixed salad leaves" }
    ],
    method: [
      "Heat the oil in a small oven-proof pan. Wilt the spinach, then stir in the sun-dried tomatoes.",
      "Whisk the eggs with a little seasoning, pour into the pan and scatter over the feta.",
      "Cook gently on the hob for 2–3 minutes until the edges set, then finish under the grill for 3–4 minutes until just set through.",
      "Serve warm or cold with the dressed leaves and chickpeas alongside."
    ],
    tip: "Frittata is one of the few things here that's genuinely as good cold from the fridge the next day — worth doubling even though it's not on the repeat schedule."
  },

  // ---------- DINNERS (shared) ----------
  {
    id: "d1", category: "dinner", title: "Steak, garlic butter mushrooms & broccoli", kcal: 535, batch: "fresh", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "British", mainIngredient: "Beef",
    ingredients: [
      { text: "180g lean sirloin or rump steak", cat: CATS.MEAT, q: "sirloin steak" },
      { text: "150g chestnut mushrooms, sliced", cat: CATS.VEG, q: "chestnut mushrooms" },
      { text: "150g broccoli or tenderstem", cat: CATS.VEG, q: "broccoli" },
      { text: "1.5 tsp butter", cat: CATS.FRIDGE, q: "butter" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "1 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "fresh thyme or parsley, to finish", cat: CATS.VEG, q: "fresh thyme" }
    ],
    hisAdd: { text: "250g baby potatoes, boiled and tossed in a little butter — or 150g sweet potato wedges, roasted.", cat: CATS.HIS, q: "baby potatoes" },
    method: [
      "Take the steak out of the fridge 20 minutes before cooking so it comes to room temperature.",
      "Steam or boil the broccoli until just tender, 4–5 minutes.",
      "Get a pan very hot with the olive oil. Season the steak well and sear 2–3 minutes each side for medium-rare (longer for your preference), then rest for 5 minutes under foil.",
      "In the same pan, melt the butter, add the mushrooms and garlic, and cook 4–5 minutes until golden.",
      "Slice the steak, plate with the mushrooms, broccoli and any resting juices spooned over."
    ],
    tip: "A cracked-pepper-and-Dijon mustard sauce (mustard, a splash of the steak's resting juices, black pepper) makes this taste like a restaurant dish — check your mustard brand is gluten-free."
  },
  {
    id: "d2", category: "dinner", title: "Mediterranean baked chicken thighs", kcal: 500, batch: "batch", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "Mediterranean", mainIngredient: "Chicken",
    ingredients: [
      { text: "2 boneless, skinless chicken thighs (about 170g)", cat: CATS.MEAT, q: "chicken thighs" },
      { text: "6 Kalamata olives", cat: CATS.CUPBOARD, q: "kalamata olives" },
      { text: "100g cherry tomatoes", cat: CATS.VEG, q: "cherry tomatoes" },
      { text: "150g courgette, sliced", cat: CATS.VEG, q: "courgette" },
      { text: "20g feta, crumbled (leave off his portion)", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1/2 lemon, juiced", cat: CATS.VEG, q: "lemon" }
    ],
    hisAdd: { text: "150g cooked rice or gluten-containing couscous, or a gluten-free orzo if you'd rather cook one grain for the table.", cat: CATS.HIS, q: "basmati rice" },
    method: [
      "Heat the oven to 200°C (fan 180°C). Toss the courgette and tomatoes with half the oil, the oregano and seasoning in a roasting dish.",
      "Nestle the chicken thighs among the vegetables, drizzle with the remaining oil and lemon juice, and scatter the olives over.",
      "Roast 25–30 minutes until the chicken is cooked through and the vegetables are soft and a little caramelised.",
      "Scatter feta over your portion only just before serving."
    ],
    tip: "This is a genuinely good batch dish — it freezes well, so cook the full amount now and freeze half flat in a bag for the week-2 repeat."
  },
  {
    id: "d3", category: "dinner", title: "Pan-seared cod with Mediterranean roasted vegetables", kcal: 515, batch: "fresh", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Mediterranean", mainIngredient: "Fish",
    ingredients: [
      { text: "220g cod loin (or another firm white fish)", cat: CATS.MEAT, q: "cod loin" },
      { text: "100g cherry tomatoes, halved", cat: CATS.VEG, q: "cherry tomatoes" },
      { text: "1/2 courgette, sliced", cat: CATS.VEG, q: "courgette" },
      { text: "1/4 red onion, wedged", cat: CATS.VEG, q: "red onion" },
      { text: "1.5 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 tsp dried thyme", cat: CATS.CUPBOARD, q: "dried thyme" },
      { text: "small handful rocket or mixed leaves", cat: CATS.VEG, q: "rocket salad" },
      { text: "1 tsp red wine vinegar", cat: CATS.CUPBOARD, q: "red wine vinegar" }
    ],
    hisAdd: { text: "200g new or crushed potatoes with butter.", cat: CATS.HIS, q: "new potatoes" },
    method: [
      "Heat the oven to 200°C (fan 180°C). Toss the tomatoes, courgette and onion with 1 tbsp of the oil and the thyme, and roast 20 minutes.",
      "Pat the cod dry and season. Heat the remaining oil in a pan and sear the cod 3 minutes skin-side (or presentation-side) down, then flip and cook 2–3 minutes more until just opaque through.",
      "Dress the leaves with the vinegar and a little oil.",
      "Plate the roasted vegetables, top with the cod, and serve the dressed leaves alongside."
    ],
    tip: "Fish doesn't reheat well, so cook this fresh both times rather than batching it — but you can chop and prep the vegetables a day ahead to save time."
  },
  {
    id: "d4", category: "dinner", title: "Turkey meatballs in tomato-basil sauce with courgetti", kcal: 540, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Italian", mainIngredient: "Turkey",
    ingredients: [
      { text: "180g turkey mince", cat: CATS.MEAT, q: "turkey mince" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1 tbsp gluten-free breadcrumbs or ground almonds, to bind", cat: CATS.CUPBOARD, q: "gluten free breadcrumbs" },
      { text: "1 egg, beaten (use a small amount to bind)", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "150g passata", cat: CATS.CUPBOARD, q: "passata" },
      { text: "fresh basil", cat: CATS.VEG, q: "fresh basil" },
      { text: "200g courgette, spiralised or ribboned", cat: CATS.VEG, q: "courgette" },
      { text: "15g toasted pine nuts", cat: CATS.CUPBOARD, q: "pine nuts" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" }
    ],
    hisAdd: { text: "100g gluten-containing spaghetti, or a shared gluten-free pasta if you'd rather cook one pot for the table.", cat: CATS.HIS, q: "spaghetti" },
    method: [
      "Mix the turkey mince with the garlic, oregano, breadcrumbs and just enough beaten egg to bind. Roll into 6–8 meatballs.",
      "Brown the meatballs in the olive oil for 4–5 minutes, turning, until coloured all over.",
      "Pour in the passata, cover, and simmer 12–15 minutes until the meatballs are cooked through.",
      "Warm the courgetti through in the sauce for the final minute, or serve it raw underneath if you prefer more bite.",
      "Scatter with basil and pine nuts."
    ],
    tip: "Double the meatballs and freeze half in their sauce — they reheat better than almost anything else on this plan."
  },
  {
    id: "d5", category: "dinner", title: "Greek-style beef koftas with tzatziki", kcal: 525, batch: "batch", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "Greek", mainIngredient: "Beef",
    ingredients: [
      { text: "170g lean (5%) beef mince", cat: CATS.MEAT, q: "lean beef mince 5%" },
      { text: "1/2 tsp ground cumin", cat: CATS.CUPBOARD, q: "ground cumin" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "1/4 red onion, finely diced", cat: CATS.VEG, q: "red onion" },
      { text: "1/2 cucumber, diced", cat: CATS.VEG, q: "cucumber" },
      { text: "1 tomato, diced", cat: CATS.VEG, q: "tomato" },
      { text: "6 Kalamata olives", cat: CATS.CUPBOARD, q: "kalamata olives" },
      { text: "30g feta, crumbled", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "2 tbsp Greek yogurt tzatziki (yogurt, grated cucumber, garlic, mint)", cat: CATS.FRIDGE, q: "greek yogurt" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" }
    ],
    hisAdd: { text: "warm gluten-containing pitta or rice, plus a dairy-free swap for the tzatziki — a squeeze of lemon and extra olive oil over his koftas works well since yogurt is off the table for him.", cat: CATS.HIS, q: "pitta bread" },
    method: [
      "Mix the mince with the cumin, oregano, garlic and a good pinch of salt. Shape into 4–6 oval koftas.",
      "Griddle or pan-fry 3–4 minutes each side until cooked through and nicely charred.",
      "Toss the cucumber, tomato and olives with the olive oil for a quick Greek salad, and crumble the feta over your portion.",
      "Serve the koftas with the salad and tzatziki on the side (yours only)."
    ],
    tip: "Form and freeze the raw koftas in a single layer, then cook straight from frozen (a few extra minutes) for a later repeat — no need to defrost first."
  },
  {
    id: "d6", category: "dinner", title: "Garlic prawn & tomato skillet with courgette noodles", kcal: 520, batch: "fresh", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Mediterranean", mainIngredient: "Seafood",
    ingredients: [
      { text: "280g raw king prawns", cat: CATS.MEAT, q: "raw king prawns" },
      { text: "2 garlic cloves, sliced", cat: CATS.VEG, q: "garlic" },
      { text: "150g cherry tomatoes, halved", cat: CATS.VEG, q: "cherry tomatoes" },
      { text: "1/2 lemon, juiced", cat: CATS.VEG, q: "lemon" },
      { text: "6 Kalamata olives", cat: CATS.CUPBOARD, q: "kalamata olives" },
      { text: "150g courgette, spiralised", cat: CATS.VEG, q: "courgette" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "chilli flakes, on the side only", cat: CATS.CUPBOARD, q: "chilli flakes" },
      { text: "fresh parsley", cat: CATS.VEG, q: "fresh parsley" }
    ],
    hisAdd: { text: "80–100g gluten-free or regular pasta tossed through the same sauce.", cat: CATS.HIS, q: "pasta" },
    method: [
      "Heat the oil in a large pan and gently cook the garlic for 30 seconds — don't let it brown.",
      "Add the tomatoes and olives and cook 3–4 minutes until the tomatoes start to break down.",
      "Add the prawns and cook 2–3 minutes until pink and just cooked through — they turn rubbery fast, so don't overcook.",
      "Toss the courgette noodles through the pan for the final minute just to warm and soften slightly, then squeeze over the lemon juice.",
      "Finish with parsley, and put chilli flakes on the table rather than in the pan."
    ],
    tip: "This is a 15-minute dish start to finish — no need to batch it, just cook it fresh both times."
  },
  {
    id: "d7", category: "dinner", title: "Herb & lemon roast chicken with ratatouille", kcal: 505, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Mediterranean", mainIngredient: "Chicken",
    ingredients: [
      { text: "220g chicken breast", cat: CATS.MEAT, q: "chicken breast" },
      { text: "1/2 lemon, juiced and zested", cat: CATS.VEG, q: "lemon" },
      { text: "1 tsp dried thyme", cat: CATS.CUPBOARD, q: "dried thyme" },
      { text: "1 aubergine, diced", cat: CATS.VEG, q: "aubergine" },
      { text: "1 courgette, diced", cat: CATS.VEG, q: "courgette" },
      { text: "1 carrot, diced", cat: CATS.VEG, q: "carrot" },
      { text: "1/2 onion, diced", cat: CATS.VEG, q: "onion" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "150g chopped tomatoes", cat: CATS.CUPBOARD, q: "chopped tomatoes" },
      { text: "1.5 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "100g green beans", cat: CATS.VEG, q: "green beans" }
    ],
    hisAdd: { text: "180g roasted sweet potato wedges.", cat: CATS.HIS, q: "sweet potato" },
    method: [
      "For the ratatouille: soften the onion, carrot and aubergine in 1 tbsp of the oil for 8–10 minutes. Add the courgette and garlic and cook 3–4 minutes more.",
      "Stir in the chopped tomatoes and simmer 15 minutes until thick and glossy.",
      "Meanwhile, marinate the chicken in the lemon juice and zest, thyme, remaining oil and seasoning for at least 15 minutes.",
      "Pan-fry or grill the chicken 6–7 minutes each side until cooked through, and steam the green beans.",
      "Serve the chicken over the ratatouille with the green beans alongside."
    ],
    tip: "Ratatouille genuinely improves after a day in the fridge — make the full batch and a later repeat will taste even better than the first."
  },
  {
    id: "d8", category: "dinner", title: "Beef & courgette lasagne", kcal: 520, batch: "batch", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "Italian", mainIngredient: "Beef",
    ingredients: [
      { text: "150g lean (5%) beef mince", cat: CATS.MEAT, q: "lean beef mince 5%" },
      { text: "1/2 onion, diced", cat: CATS.VEG, q: "onion" },
      { text: "1 carrot, diced", cat: CATS.VEG, q: "carrot" },
      { text: "2 garlic cloves, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "400g chopped tomatoes", cat: CATS.CUPBOARD, q: "chopped tomatoes" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1 tsp dried basil", cat: CATS.CUPBOARD, q: "dried basil" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 large courgette, sliced lengthways into thin ribbons", cat: CATS.VEG, q: "courgette" },
      { text: "30g mozzarella or cheddar, grated", cat: CATS.FRIDGE, q: "grated mozzarella" },
      { text: "fresh basil, to finish", cat: CATS.VEG, q: "fresh basil" }
    ],
    hisAdd: { text: "4–5 dried gluten-containing lasagne sheets, cooked and layered in place of the courgette — or garlic bread on the side.", cat: CATS.HIS, q: "lasagne sheets" },
    method: [
      "Heat the oil in a pan and soften the onion and carrot for 5–6 minutes, then add the garlic and cook 1 minute more.",
      "Add the mince and brown for 5 minutes, breaking it up, then stir in the chopped tomatoes, oregano and basil. Simmer 20 minutes until rich and thickened.",
      "Meanwhile, salt the courgette ribbons and leave for 10 minutes to draw out excess moisture, then pat dry — this stops the lasagne turning watery.",
      "In a small ovenproof dish, layer the ragù and courgette ribbons two or three times, finishing with ragù. Scatter the cheese over the top.",
      "Bake at 190°C (fan 170°C) for 20–25 minutes until bubbling and the cheese is golden. Rest 5 minutes before serving."
    ],
    tip: "A layer of fresh basil between the courgette and the ragù keeps every bite tasting bright rather than heavy — a few anchovy fillets stirred into the ragù add a deep savoury note if you like."
  },
  {
    id: "d9", category: "dinner", title: "Spaghetti bolognese with courgetti", kcal: 500, batch: "batch", gf: true, vegetarian: false, dairyFree: false,
    cuisine: "Italian", mainIngredient: "Beef",
    ingredients: [
      { text: "170g lean (5%) beef mince", cat: CATS.MEAT, q: "lean beef mince 5%" },
      { text: "1/2 onion, diced", cat: CATS.VEG, q: "onion" },
      { text: "1 carrot, diced", cat: CATS.VEG, q: "carrot" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "300g passata", cat: CATS.CUPBOARD, q: "passata" },
      { text: "1 tbsp tomato purée", cat: CATS.CUPBOARD, q: "tomato puree" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "200g courgette, spiralised", cat: CATS.VEG, q: "courgette" },
      { text: "fresh basil, to finish", cat: CATS.VEG, q: "fresh basil" },
      { text: "shaved hard cheese, optional", cat: CATS.FRIDGE, q: "parmesan" }
    ],
    hisAdd: { text: "100g gluten-containing spaghetti, cooked and tossed through the same sauce.", cat: CATS.HIS, q: "spaghetti" },
    method: [
      "Heat the oil in a pan and soften the onion and carrot for 5–6 minutes, then add the garlic and cook 1 minute more.",
      "Add the mince and brown for 5 minutes, then stir in the passata, tomato purée and oregano. Simmer 20–25 minutes, covered, stirring occasionally, until rich and thick.",
      "In the last 2 minutes, warm the courgetti through in a splash of the sauce, or serve it raw underneath if you prefer more bite.",
      "Finish with basil and a little shaved cheese if using."
    ],
    tip: "A splash of balsamic vinegar stirred in at the end deepens the flavour without needing any wine or stock."
  },
  {
    id: "d10", category: "dinner", title: "Aubergine & lentil lasagne (no béchamel)", kcal: 470, batch: "batch", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Greek", mainIngredient: "Vegetarian",
    ingredients: [
      { text: "2 aubergines, sliced lengthways into 0.5cm strips", cat: CATS.VEG, q: "aubergine" },
      { text: "2 tins green or brown lentils, drained (about 400g)", cat: CATS.CUPBOARD, q: "tinned lentils" },
      { text: "1 onion, diced", cat: CATS.VEG, q: "onion" },
      { text: "2 garlic cloves, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "400g chopped tomatoes", cat: CATS.CUPBOARD, q: "chopped tomatoes" },
      { text: "1 tsp dried oregano", cat: CATS.CUPBOARD, q: "dried oregano" },
      { text: "1/2 tsp ground cinnamon", cat: CATS.CUPBOARD, q: "ground cinnamon" },
      { text: "2 tbsp olive oil, plus extra for brushing", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "25g feta, crumbled", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "fresh parsley, to finish", cat: CATS.VEG, q: "fresh parsley" }
    ],
    hisAdd: { text: "warm gluten-containing flatbread or crusty bread on the side.", cat: CATS.HIS, q: "flatbread" },
    method: [
      "Brush the aubergine slices with a little olive oil and grill or griddle 3–4 minutes each side until charred and tender. Set aside.",
      "Heat the remaining oil in a pan, soften the onion for 5–6 minutes, then add the garlic and cinnamon and cook 1 minute more.",
      "Stir in the lentils, chopped tomatoes and oregano. Simmer 12–15 minutes until thickened.",
      "Layer the aubergine and lentil ragù in a small ovenproof dish, finishing with a layer of aubergine.",
      "Scatter feta over the top and bake at 190°C (fan 170°C) for 15 minutes until lightly golden.",
      "Finish with parsley."
    ],
    tip: "No béchamel here on purpose — the cinnamon in the ragù gives that same cosy warmth without a dairy sauce, and it reheats beautifully the next day. This one's fully vegetarian, so it's an easy batch to double."
  },
  {
    id: "d11", category: "dinner", title: "Mild red Thai curry with chicken", kcal: 480, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Thai", mainIngredient: "Chicken",
    ingredients: [
      { text: "200g chicken breast, sliced", cat: CATS.MEAT, q: "chicken breast" },
      { text: "1 tbsp red Thai curry paste (check label for gluten-free)", cat: CATS.CUPBOARD, q: "red thai curry paste" },
      { text: "160ml light coconut milk", cat: CATS.CUPBOARD, q: "light coconut milk" },
      { text: "1 tsp fish sauce (check gluten-free)", cat: CATS.CUPBOARD, q: "fish sauce" },
      { text: "100g mangetout or green beans", cat: CATS.VEG, q: "mangetout" },
      { text: "100g cauliflower rice", cat: CATS.VEG, q: "cauliflower rice" },
      { text: "1/2 lime, juiced", cat: CATS.VEG, q: "lime" },
      { text: "fresh coriander or Thai basil, to finish", cat: CATS.VEG, q: "fresh coriander" }
    ],
    hisAdd: { text: "150g cooked jasmine rice.", cat: CATS.HIS, q: "jasmine rice" },
    method: [
      "Fry the curry paste in a dry pan for 1 minute until fragrant — this mellows the flavour rather than tasting raw.",
      "Add the chicken and cook 3–4 minutes until it starts to colour.",
      "Pour in the coconut milk and fish sauce, bring to a gentle simmer, and cook 8–10 minutes until the chicken is cooked through.",
      "Add the mangetout or green beans for the final 3–4 minutes.",
      "Stir through the lime juice and warm the cauliflower rice through (a few minutes in a dry pan, or from the packet).",
      "Finish with coriander or Thai basil."
    ],
    tip: "Go easy on the paste — most shop-bought red curry pastes bring plenty of background warmth without any extra heat needed. Keep chilli oil on the table for him if he wants more kick."
  },

  // ---------- SPANISH ----------
  {
    id: "d12", category: "dinner", title: "Spanish garlic prawns with white beans", kcal: 490, batch: "fresh", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Spanish", mainIngredient: "Seafood",
    ingredients: [
      { text: "250g raw king prawns", cat: CATS.MEAT, q: "raw king prawns" },
      { text: "3 garlic cloves, sliced", cat: CATS.VEG, q: "garlic" },
      { text: "1/2 tsp sweet smoked paprika", cat: CATS.CUPBOARD, q: "smoked paprika" },
      { text: "200g cannellini beans, drained", cat: CATS.CUPBOARD, q: "cannellini beans" },
      { text: "100g cherry tomatoes, halved", cat: CATS.VEG, q: "cherry tomatoes" },
      { text: "2 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1/2 lemon, juiced", cat: CATS.VEG, q: "lemon" },
      { text: "fresh parsley, chopped", cat: CATS.VEG, q: "fresh parsley" }
    ],
    hisAdd: { text: "Warm gluten-containing crusty bread for mopping up the oil.", cat: CATS.HIS, q: "crusty bread" },
    method: [
      "Warm the oil gently in a pan and cook the garlic for 30 seconds — keep the heat low so it doesn't catch.",
      "Stir in the smoked paprika, then add the beans and tomatoes and cook 3–4 minutes until the tomatoes soften.",
      "Turn up the heat, add the prawns, and cook 2–3 minutes until just pink through.",
      "Squeeze over the lemon juice and scatter with parsley."
    ],
    tip: "This is classic gambas al ajillo, gentled down — the smoked paprika gives warmth without any chilli. A splash of dry sherry (or a squeeze more lemon) added with the beans deepens it further."
  },
  {
    id: "l5", category: "lunch", title: "Spanish-style tuna & potato salad", kcal: 445, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Spanish", mainIngredient: "Fish",
    ingredients: [
      { text: "145g tin tuna in spring water, drained", cat: CATS.CUPBOARD, q: "tuna in spring water" },
      { text: "150g baby potatoes, boiled and cooled", cat: CATS.VEG, q: "baby potatoes" },
      { text: "1 roasted red pepper (jarred is fine), sliced", cat: CATS.VEG, q: "roasted red peppers" },
      { text: "6 pitted green olives, halved", cat: CATS.CUPBOARD, q: "green olives" },
      { text: "2 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 tsp red wine vinegar", cat: CATS.CUPBOARD, q: "red wine vinegar" },
      { text: "1/4 red onion, thinly sliced", cat: CATS.VEG, q: "red onion" },
      { text: "handful fresh parsley, chopped", cat: CATS.VEG, q: "fresh parsley" }
    ],
    method: [
      "Halve the cooled potatoes and toss with the olive oil and vinegar while still slightly warm — they take on flavour better this way.",
      "Flake in the tuna and add the pepper, olives and red onion.",
      "Toss gently and finish with parsley."
    ],
    tip: "This is a lightened ensaladilla — good cold from the fridge for up to 3 days, so it batches well even though the potato content means it's a heavier lunch than most on the plan."
  },
  {
    id: "br5", category: "brunch", title: "Spanish-style tortilla with peppers", kcal: 700, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Spanish", mainIngredient: "Eggs",
    ingredients: [
      { text: "4 eggs", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "200g baby potatoes, thinly sliced", cat: CATS.VEG, q: "baby potatoes" },
      { text: "1 red pepper, sliced", cat: CATS.VEG, q: "red pepper" },
      { text: "1/2 onion, thinly sliced", cat: CATS.VEG, q: "onion" },
      { text: "2 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "small handful mixed leaves, dressed with lemon", cat: CATS.VEG, q: "mixed salad leaves" },
      { text: "25g manchego or hard cheese, shaved (optional)", cat: CATS.FRIDGE, q: "manchego cheese" }
    ],
    method: [
      "Gently cook the potatoes, pepper and onion in the oil over low heat for 15 minutes, stirring occasionally, until soft but not coloured.",
      "Whisk the eggs with a pinch of salt, then stir through the cooked vegetables.",
      "Pour back into the pan and cook over low heat 6–8 minutes until mostly set, then finish under the grill 2–3 minutes until just set on top.",
      "Rest 5 minutes, then slice into wedges and serve with the dressed leaves."
    ],
    tip: "Good at room temperature, not just hot — makes this an easy one to prep ahead of a lazy weekend brunch."
  },

  // ---------- MIDDLE EASTERN / LEBANESE ----------
  {
    id: "d13", category: "dinner", title: "Lebanese lemon garlic chicken with grilled vegetables", kcal: 495, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Middle Eastern", mainIngredient: "Chicken",
    ingredients: [
      { text: "200g chicken thigh fillets", cat: CATS.MEAT, q: "chicken thigh fillets" },
      { text: "1/2 lemon, juiced", cat: CATS.VEG, q: "lemon" },
      { text: "2 garlic cloves, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "1 tsp ground cumin", cat: CATS.CUPBOARD, q: "ground cumin" },
      { text: "1/2 tsp ground allspice", cat: CATS.CUPBOARD, q: "ground allspice" },
      { text: "1 courgette, sliced lengthways", cat: CATS.VEG, q: "courgette" },
      { text: "1 red pepper, quartered", cat: CATS.VEG, q: "red pepper" },
      { text: "1.5 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "fresh mint, chopped", cat: CATS.VEG, q: "fresh mint" }
    ],
    hisAdd: { text: "warm gluten-containing pitta or 150g cooked rice.", cat: CATS.HIS, q: "pitta bread" },
    method: [
      "Marinate the chicken in the lemon juice, garlic, cumin, allspice and half the oil for at least 20 minutes (or overnight).",
      "Griddle or grill the chicken 6–7 minutes each side until charred and cooked through.",
      "Toss the courgette and pepper in the remaining oil and griddle alongside, 3–4 minutes each side.",
      "Scatter with mint and serve chicken and vegetables together."
    ],
    tip: "This is a shish-taouk-style marinade — the lemon and allspice combination is the whole flavour, no heat needed at all."
  },
  {
    id: "l6", category: "lunch", title: "Lebanese lentil & mint salad bowl", kcal: 420, batch: "batch", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Middle Eastern", mainIngredient: "Vegetarian",
    ingredients: [
      { text: "150g cooked green lentils (tinned is fine)", cat: CATS.CUPBOARD, q: "tinned lentils" },
      { text: "1/2 cucumber, diced", cat: CATS.VEG, q: "cucumber" },
      { text: "1 tomato, diced", cat: CATS.VEG, q: "tomato" },
      { text: "1/4 red onion, finely diced", cat: CATS.VEG, q: "red onion" },
      { text: "fresh mint and parsley, chopped", cat: CATS.VEG, q: "fresh mint" },
      { text: "1 tbsp tahini, thinned with lemon and water", cat: CATS.CUPBOARD, q: "tahini" },
      { text: "1/2 lemon, juiced", cat: CATS.VEG, q: "lemon" },
      { text: "30g feta, crumbled", cat: CATS.FRIDGE, q: "feta cheese" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" }
    ],
    method: [
      "Toss the lentils, cucumber, tomato and red onion together.",
      "Whisk the tahini with the lemon juice and a splash of water until drizzle consistency.",
      "Dress the salad, scatter with the herbs and feta, and finish with a drizzle of olive oil."
    ],
    tip: "No cooking needed if you use tinned lentils — this is another easy no-cook batch lunch alongside the tuna & white bean salad."
  },
  {
    id: "bf5", category: "breakfast", title: "Labneh-style yogurt with za'atar & olive oil", kcal: 305, batch: "fresh", gf: true, vegetarian: true, dairyFree: false,
    cuisine: "Middle Eastern", mainIngredient: "Vegetarian",
    ingredients: [
      { text: "200g thick Greek yogurt", cat: CATS.FRIDGE, q: "Greek yogurt" },
      { text: "1 tsp za'atar (check label for gluten-free)", cat: CATS.CUPBOARD, q: "zaatar" },
      { text: "1.5 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1/2 cucumber, sliced, to serve", cat: CATS.VEG, q: "cucumber" },
      { text: "small handful cherry tomatoes, to serve", cat: CATS.VEG, q: "cherry tomatoes" }
    ],
    method: [
      "Spoon the yogurt onto a plate or shallow bowl and spread slightly.",
      "Scatter the za'atar over and drizzle with the olive oil.",
      "Serve with the cucumber and tomatoes alongside."
    ],
    tip: "Genuinely a 2-minute breakfast — good za'atar (thyme, sumac, sesame) is worth seeking out, it does all the work here."
  },

  // ---------- MEXICAN ----------
  {
    id: "d14", category: "dinner", title: "Chicken fajita bowl with cauliflower rice", kcal: 485, batch: "fresh", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Mexican", mainIngredient: "Chicken",
    ingredients: [
      { text: "200g chicken breast, sliced into strips", cat: CATS.MEAT, q: "chicken breast" },
      { text: "1 red pepper, sliced", cat: CATS.VEG, q: "red pepper" },
      { text: "1 green pepper, sliced", cat: CATS.VEG, q: "green pepper" },
      { text: "1/2 onion, sliced", cat: CATS.VEG, q: "onion" },
      { text: "1 tsp ground cumin", cat: CATS.CUPBOARD, q: "ground cumin" },
      { text: "1/2 tsp smoked paprika", cat: CATS.CUPBOARD, q: "smoked paprika" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1 lime, juiced", cat: CATS.VEG, q: "lime" },
      { text: "150g cauliflower rice", cat: CATS.VEG, q: "cauliflower rice" },
      { text: "1/4 avocado, sliced", cat: CATS.VEG, q: "avocado" },
      { text: "fresh coriander, to finish", cat: CATS.VEG, q: "fresh coriander" }
    ],
    hisAdd: { text: "2 warm gluten-containing tortilla wraps or 150g cooked rice.", cat: CATS.HIS, q: "flour tortillas" },
    method: [
      "Toss the chicken with the cumin, paprika and half the oil.",
      "Heat the remaining oil in a large pan and stir-fry the peppers and onion 4–5 minutes until just softened.",
      "Push the vegetables aside, add the chicken, and cook 5–6 minutes until cooked through, then toss everything together.",
      "Warm the cauliflower rice through, squeeze over the lime juice, and serve topped with avocado and coriander."
    ],
    tip: "Mild by design — put hot sauce or pickled jalapeños on the table for anyone who wants heat rather than cooking it in."
  },
  {
    id: "l7", category: "lunch", title: "Mexican-style black bean & lime chicken salad", kcal: 460, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Mexican", mainIngredient: "Chicken",
    ingredients: [
      { text: "120g cooked chicken breast, shredded", cat: CATS.MEAT, q: "chicken breast" },
      { text: "120g black beans, drained and rinsed", cat: CATS.CUPBOARD, q: "black beans" },
      { text: "80g sweetcorn", cat: CATS.VEG, q: "sweetcorn" },
      { text: "1/2 red pepper, diced", cat: CATS.VEG, q: "red pepper" },
      { text: "1/4 red onion, finely diced", cat: CATS.VEG, q: "red onion" },
      { text: "1 lime, juiced", cat: CATS.VEG, q: "lime" },
      { text: "1 tbsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "fresh coriander, chopped", cat: CATS.VEG, q: "fresh coriander" },
      { text: "1/4 avocado, sliced", cat: CATS.VEG, q: "avocado" }
    ],
    method: [
      "Toss the beans, sweetcorn, pepper and red onion together.",
      "Whisk the lime juice and oil, toss through the salad, then add the shredded chicken.",
      "Top with avocado and coriander."
    ],
    tip: "Grill extra chicken breasts alongside another recipe in the week and shred them for this — makes the whole thing a 5-minute assembly job."
  },
  {
    id: "bf6", category: "breakfast", title: "Mexican-style egg scramble with black beans", kcal: 325, batch: "fresh", gf: true, vegetarian: true, dairyFree: true,
    cuisine: "Mexican", mainIngredient: "Eggs",
    ingredients: [
      { text: "2 eggs", cat: CATS.FRIDGE, q: "free range eggs" },
      { text: "60g black beans, drained and rinsed", cat: CATS.CUPBOARD, q: "black beans" },
      { text: "1 small tomato, diced", cat: CATS.VEG, q: "tomato" },
      { text: "1/4 red onion, finely diced", cat: CATS.VEG, q: "red onion" },
      { text: "2 tsp olive oil", cat: CATS.CUPBOARD, q: "olive oil" },
      { text: "1/4 avocado, sliced", cat: CATS.VEG, q: "avocado" },
      { text: "fresh coriander, to finish", cat: CATS.VEG, q: "fresh coriander" }
    ],
    method: [
      "Warm the oil and soften the onion for 2 minutes, then add the tomato and black beans and cook 2 minutes more.",
      "Whisk the eggs and pour in, scrambling gently until just set.",
      "Top with avocado and coriander."
    ],
    tip: "A pinch of ground cumin stirred in with the beans adds warmth without any heat — keep hot sauce on the side for anyone who wants it."
  },

  // ---------- JAPANESE ----------
  {
    id: "d15", category: "dinner", title: "Teriyaki-style salmon with sesame greens", kcal: 510, batch: "fresh", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Japanese", mainIngredient: "Fish",
    ingredients: [
      { text: "180g salmon fillet", cat: CATS.MEAT, q: "salmon fillet" },
      { text: "1.5 tbsp gluten-free tamari", cat: CATS.CUPBOARD, q: "gluten free tamari" },
      { text: "1 tsp honey", cat: CATS.CUPBOARD, q: "honey" },
      { text: "1 tsp grated ginger", cat: CATS.VEG, q: "fresh ginger" },
      { text: "1 garlic clove, crushed", cat: CATS.VEG, q: "garlic" },
      { text: "150g pak choi or tenderstem broccoli", cat: CATS.VEG, q: "pak choi" },
      { text: "1 tsp sesame oil", cat: CATS.CUPBOARD, q: "sesame oil" },
      { text: "1 tsp sesame seeds", cat: CATS.CUPBOARD, q: "sesame seeds" },
      { text: "100g cauliflower rice", cat: CATS.VEG, q: "cauliflower rice" }
    ],
    hisAdd: { text: "150g cooked jasmine or sushi rice.", cat: CATS.HIS, q: "sushi rice" },
    method: [
      "Whisk the tamari, honey, ginger and garlic together and marinate the salmon 10–15 minutes.",
      "Pan-fry or grill the salmon 3–4 minutes skin-side down, then flip and cook 2–3 minutes more, brushing with the marinade as it cooks.",
      "Steam the pak choi and toss with the sesame oil and seeds.",
      "Warm the cauliflower rice through and serve everything together."
    ],
    tip: "Check your tamari and honey brands are gluten-free — most tamari is, but soy sauce usually isn't. A little extra ginger grated over at the end brightens the whole dish."
  },
  {
    id: "l8", category: "lunch", title: "Japanese-style sesame ginger chicken & edamame salad", kcal: 440, batch: "batch", gf: true, vegetarian: false, dairyFree: true,
    cuisine: "Japanese", mainIngredient: "Chicken",
    ingredients: [
      { text: "120g cooked chicken breast, sliced", cat: CATS.MEAT, q: "chicken breast" },
      { text: "80g edamame beans, cooked", cat: CATS.VEG, q: "edamame beans" },
      { text: "1/2 cucumber, ribboned", cat: CATS.VEG, q: "cucumber" },
      { text: "1 carrot, ribboned", cat: CATS.VEG, q: "carrot" },
      { text: "1 tbsp gluten-free tamari", cat: CATS.CUPBOARD, q: "gluten free tamari" },
      { text: "1 tsp sesame oil", cat: CATS.CUPBOARD, q: "sesame oil" },
      { text: "1 tsp rice vinegar", cat: CATS.CUPBOARD, q: "rice vinegar" },
      { text: "1 tsp grated ginger", cat: CATS.VEG, q: "fresh ginger" },
      { text: "1 tsp sesame seeds", cat: CATS.CUPBOARD, q: "sesame seeds" }
    ],
    method: [
      "Whisk the tamari, sesame oil, rice vinegar and ginger together.",
      "Toss the cucumber, carrot and edamame with the dressing.",
      "Top with the sliced chicken and scatter with sesame seeds."
    ],
    tip: "No cooking needed if the chicken and edamame are already cooked — another good grab-from-the-fridge lunch."
  }
];

// Default 14-day rotation — every meal slot can be swapped from the picker,
// this is just the starting point. Every day gets all three of breakfast,
// lunch and dinner (breakfast/lunch cycle through the 4 options each, dinner
// cycles through the 7 dinners) — brunch dishes still live in the pool if
// you want to swap one in for breakfast+lunch some day via "Choose meal".
const DEFAULT_PLAN = [
  { n: 1,  week: 1, weekday: "Monday",    slots: [{ k: "breakfast", id: "bf1" }, { k: "lunch", id: "l1" }, { k: "dinner", id: "d1" }] },
  { n: 2,  week: 1, weekday: "Tuesday",   slots: [{ k: "breakfast", id: "bf2" }, { k: "lunch", id: "l2" }, { k: "dinner", id: "d2" }] },
  { n: 3,  week: 1, weekday: "Wednesday", slots: [{ k: "breakfast", id: "bf3" }, { k: "lunch", id: "l3" }, { k: "dinner", id: "d3" }] },
  { n: 4,  week: 1, weekday: "Thursday",  slots: [{ k: "breakfast", id: "bf4" }, { k: "lunch", id: "l4" }, { k: "dinner", id: "d4" }] },
  { n: 5,  week: 1, weekday: "Friday",    slots: [{ k: "breakfast", id: "bf1" }, { k: "lunch", id: "l1" }, { k: "dinner", id: "d5" }] },
  { n: 6,  week: 1, weekday: "Saturday",  slots: [{ k: "breakfast", id: "bf2" }, { k: "lunch", id: "l2" }, { k: "dinner", id: "d6" }] },
  { n: 7,  week: 1, weekday: "Sunday",    slots: [{ k: "breakfast", id: "bf3" }, { k: "lunch", id: "l3" }, { k: "dinner", id: "d7" }] },
  { n: 8,  week: 2, weekday: "Monday",    slots: [{ k: "breakfast", id: "bf4" }, { k: "lunch", id: "l4" }, { k: "dinner", id: "d1" }] },
  { n: 9,  week: 2, weekday: "Tuesday",   slots: [{ k: "breakfast", id: "bf1" }, { k: "lunch", id: "l1" }, { k: "dinner", id: "d2" }] },
  { n: 10, week: 2, weekday: "Wednesday", slots: [{ k: "breakfast", id: "bf2" }, { k: "lunch", id: "l2" }, { k: "dinner", id: "d3" }] },
  { n: 11, week: 2, weekday: "Thursday",  slots: [{ k: "breakfast", id: "bf3" }, { k: "lunch", id: "l3" }, { k: "dinner", id: "d4" }] },
  { n: 12, week: 2, weekday: "Friday",    slots: [{ k: "breakfast", id: "bf4" }, { k: "lunch", id: "l4" }, { k: "dinner", id: "d5" }] },
  { n: 13, week: 2, weekday: "Saturday",  slots: [{ k: "breakfast", id: "bf1" }, { k: "lunch", id: "l1" }, { k: "dinner", id: "d6" }] },
  { n: 14, week: 2, weekday: "Sunday",    slots: [{ k: "breakfast", id: "bf2" }, { k: "lunch", id: "l2" }, { k: "dinner", id: "d7" }] }
];

const PANTRY = [
  { name: "Extra virgin olive oil", note: "the backbone of almost every recipe here — use a good one for finishing, a cheaper one for cooking.", q: "extra virgin olive oil" },
  { name: "Garlic & lemons", note: "buy more than you think — both feature constantly.", q: "garlic" },
  { name: "Dried oregano, thyme & mild smoked paprika", note: "the core Mediterranean flavour trio; none of them bring heat.", q: "dried oregano" },
  { name: "Fresh parsley, dill & basil", note: "whichever you can get fresh lifts a dish enormously — dried is a fine backup.", q: "fresh parsley" },
  { name: "Kalamata olives & artichoke hearts", note: "briny, savoury, and do a lot of work for very few calories — a capers-free way to get that same Mediterranean lift.", q: "kalamata olives" },
  { name: "Sun-dried tomatoes (in oil)", note: "a spoonful adds concentrated flavour to eggs, frittata or a salad.", q: "sun-dried tomatoes" },
  { name: "Red wine vinegar & balsamic vinegar", note: "both naturally gluten-free — good for quick dressings.", q: "balsamic vinegar" },
  { name: "Gluten-free Dijon mustard", note: "most are gluten-free but brands vary — check the label; great in a pan sauce for steak.", q: "dijon mustard" },
  { name: "Tahini", note: "thin with lemon and water for an instant Mediterranean drizzle sauce over almost anything.", q: "tahini" },
  { name: "Chilli flakes, kept separate", note: "so your partner can add heat to his own plate without any dish being spicy for you.", q: "chilli flakes" },
  { name: "Gluten-free stock cubes or bouillon", note: "some standard stock cubes contain barley — look for a certified gluten-free one.", q: "gluten free stock cubes" },
  { name: "Flaky sea salt & cracked black pepper", note: "season at the end as well as during cooking — it makes a bigger difference than any single condiment.", q: "flaky sea salt" },
  { name: "Mild red Thai curry paste & light coconut milk", note: "for the Thai curry — go easy on the paste to keep it mild, and check the paste label for gluten.", q: "red thai curry paste" }
];

const SLOT_LABELS = { breakfast: "Breakfast", brunch: "Brunch", lunch: "Lunch", dinner: "Dinner" };
