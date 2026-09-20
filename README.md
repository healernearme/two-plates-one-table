# Two Plates, One Table

A free, no-login meal planner for two people with different diets — a pool of Mediterranean, gluten-free recipes, a 14-day planner where any meal can be swapped for another from the pool, a shopping list that rebuilds itself from whatever's currently planned (with one-tap Ocado search links), and a pantry/condiments reference.

It's a plain static site (HTML/CSS/JS, no build step), hosted free on GitHub Pages.

## Turn on syncing (optional, ~3 minutes)

Without this step, the site still works fully — it just remembers your picks and ticks on whichever device you're using, separately for each device. To make you and your partner see the same plan everywhere, it stores its state in a Google Sheet you own, using a small free script as the bridge.

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet — call it whatever you like, e.g. "Meal Planner Sync".
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of [`apps-script/Code.gs`](apps-script/Code.gs) from this repo.
4. Click **Deploy → New deployment**. For "Select type", choose **Web app**.
5. Set **Execute as: Me**, and **Who has access: Anyone**. Click **Deploy**.
6. Google will ask you to authorise the script the first time — that's expected, it's your own script running in your own account.
7. Copy the **Web app URL** it gives you (ends in `/exec`).
8. Back in this repo on GitHub, open `config.js`, replace the empty `""` with your URL (`const SYNC_URL = "https://script.google.com/macros/s/.../exec";`), and commit the change directly in GitHub's web editor — no git needed.
9. Reload the site — the note under the tabs should say "Synced ✓".

Both of you open the same site URL; there's nothing for your partner to install or sign up for.

## Adding or editing meals

Everything lives in `data.js`:

- `MEALS` — the full pool. Copy an existing entry to add a new one; `category` must be `"breakfast"`, `"brunch"`, `"lunch"` or `"dinner"` so it shows up in the right places. Each ingredient needs `cat` (which shopping-list section it belongs in) and `q` (a short search term for its Ocado link).
- `DEFAULT_PLAN` — which meal starts assigned to each day/slot. This is just the starting point; anyone can swap it from the Planner tab.
- `PANTRY` — the condiments/flavour reference list.

Commit changes to `data.js` (directly on GitHub, or via git) and the live site updates automatically within a minute or two.

## Why Ocado links, not live Ocado prices/ordering

Ocado doesn't offer a public API for personal projects — the only "Ocado APIs" around are paid third-party scrapers, which this project deliberately avoids. Each ingredient instead gets a link to Ocado's own product search for that item, so adding it to your basket is one extra click rather than a manual search.

## Local preview

Just open `index.html` in a browser — everything runs client-side, no server or build step required.
