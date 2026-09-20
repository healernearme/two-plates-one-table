# Two Plates, One Table

A free, no-login meal planner for two people with different diets — a pool of Mediterranean, gluten-free recipes, a 14-day planner where any meal can be swapped for another from the pool, a shopping list that rebuilds itself from whatever's currently planned (with one-tap Ocado search links), and a pantry/condiments reference.

It's a plain static site (HTML/CSS/JS, no build step), hosted free on GitHub Pages.

## Turn on syncing (optional, ~3 minutes)

Without this step, the site still works fully — it just remembers your picks and ticks on whichever device you're using, separately for each device. To make you and your partner see the same plan everywhere, it stores its state in a free Firebase Realtime Database you own — no server code to write or deploy, just a URL you paste in.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with any Google account — only you need one, your partner doesn't need an account at all.
2. Click **Add project**, give it any name (e.g. "meal-planner-sync"), and finish the setup wizard — you can skip Google Analytics.
3. In the left sidebar, go to **Build → Realtime Database → Create Database**. Pick any region and start in **test mode**.
4. Once it's created, open the **Rules** tab and replace the rules with:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   Click **Publish**. This makes the database reachable by anyone who has its URL — the same trust model as the site itself, since that URL is never shared or indexed anywhere.
5. Back on the **Data** tab, copy the URL shown at the top (something like `https://meal-planner-sync-default-rtdb.europe-west1.firebasedatabase.app`) — that's your database URL.
6. Back in this repo on GitHub, open `config.js`, replace the empty `""` with your URL (`const SYNC_URL = "https://your-project-default-rtdb.firebaseio.com";`, no trailing slash), and commit the change directly in GitHub's web editor — no git needed.
7. Reload the site — the note under the tabs should say "Synced ✓".

Both of you open the same site URL; there's nothing for your partner to install or sign up for.

*(An older version of this site used a Google Sheet + Apps Script for syncing instead — `apps-script/Code.gs` is still in this repo for reference, but Firebase above is simpler and is what `sync.js` talks to now.)*

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
