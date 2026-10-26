# Five TD’s website — editing guide

## Units
Edit `src/data/units.json`. **Each unit is one object in the JSON list.** Copy an existing unit object, paste it before the closing `]`, and separate objects with commas. Keep `id` unique and lowercase with hyphens.

Example (shape only; numbers are illustrative):

```json
{
  "id": "new-unit",
  "name": "New Unit",
  "rarity": "Rare",
  "type": "Single",
  "image": "units/new-unit.png",
  "capacity": 2,
  "obtainable": "Summon",
  "added": "2026-10-18",
  "addedUpdate": "EXAMPLE UPDATE",
  "levels": [
    { "level": 1, "cost": 100, "damage": 10, "range": 8, "fireRate": 1 },
    { "level": 2, "cost": 200, "damage": 15, "range": 9, "fireRate": 1.1 }
  ]
}
```

Add **as many levels as that unit actually has**, beginning with level 1. `cost` on level 1 is its placement cost; later costs are the corresponding level costs. `damage` can represent a multiplier for buff/debuff units; check the data notes below. No description or upgrades property is required.

Put art in `public/units/` and set the unit's `image` to `units/filename.png` (not `public/units/...`). Leave `image` as `""` for a placeholder. Images also work after GitHub Pages deployment.

## Levels and chapters
Edit `src/data/levels.json`. The root has a `chapters` array. Each chapter includes its numeric `id`, `name`, `added`, `addedUpdate`, a `levels` array, and optionally an `endless` object (or `null` when the chapter has no Endless mode).

A standard level looks like:
```json
{
  "number": 12,
  "name": "Example Stage",
  "waves": 20,
  "boss": "Example Boss",
  "normal": {"fazCoins": 100, "remnant": [5, 6], "startingMoney": 400},
  "max": {"fazCoins": 150, "remnant": [6, 7], "startingMoney": 800}
}
```
The two Remnant numbers define a range. Use `[2,2]` for a fixed reward of two. Use `"boss": null` when there is no boss. Difficulty selection is shared across the level list and its detail pages and defaults to Normal on a fresh page load. Wave counts and boss are shared by both modes.

For Endless, `startingMoney.normal` and `startingMoney.max` differ but rewards are shared. `fazCoinsEveryTenWaves` contains rewards for waves 10 through 100; `fazCoinsAfterWave100` is paid every 10 waves starting at wave 110; `remnantEveryTenWaves` is a randomized inclusive range; `unitId` references an entry in `units.json` (its unit image is displayed automatically); `bosses` is a list of boss names.

To add Chapter 2, copy an existing chapter object inside the `chapters` array, change its `id` to 2 and its `name`, dates and level list. Use `"endless": null` if there is no Endless mode for the new chapter. No React edits required.

## Features
Edit `src/data/features.json`. The Features page shows a **non-navigating card** for each entry (clicking its image enlarges that image). No category, summary, or separate feature page is needed. Cards show the image, name, where the feature is accessed, the added date, and exactly two details.

To add a feature, copy an existing object inside the JSON list and change its values. Keep the `id` unique (lowercase words separated with hyphens). Example:

```json
{
  "id": "sample-feature",
  "title": "Sample Feature",
  "image": "features/SampleFeature.jpg",
  "accessed": "Lobby",
  "added": "2026-10-26",
  "addedUpdate": "EXAMPLE UPDATE",
  "details": [
    "First piece of information about this feature.",
    "Second piece of information about this feature."
  ]
}
```

The date must be `YYYY-MM-DD`. `addedUpdate` is **optional**: omit that key when the feature isn't associated with a named update, as with Teasers. Place feature images in `public/features/` and set `image` to `features/ExactFilename.jpg` (do not include `public/`). PNG images also work. Keep filenames and capitalization exact, especially for GitHub Pages.

The nine current features use the existing `.jpg` screenshots in `public/features/`. Changing a screenshot without changing its filename needs no JSON edit.

## Appearance and navigation

The first visual overhaul uses a dark theme with royal blue and purple accents. The site loads the Google Fonts version of **Press Start 2P** from `src/index.css`; if it cannot load, the browser falls back to a monospace font.

- `src/App.css`: colors (at the top), spacing, layout, icon grid sizes, buttons and responsive rules.
- `src/index.css`: global font and body defaults.
- `src/App.tsx`: page structure, home hero, image tiles and unit popup interaction.
- `public/general/Thumbnail2.jpg`: the large home banner image. Change the file or change its path in `src/App.tsx`.
- `public/general/Logo.png`: original logo; `public/general/Logo-Cropped.png` is a tighter version used in the navigation and banner.
- `public/general/Favicon.png`: browser tab icon. It's referenced by `index.html`.

**Units:** Icons are displayed without labels, grouped in this order: Common, Uncommon, Rare, Epic, Exclusive, Legendary, and alphabetically within each rarity. Search still works. Click an icon to open its details popup; press Escape, click Close, or click the dark backdrop to close it. No per-unit React page is needed. Unit content stays in `units.json`.

**Levels:** Click a chapter row to expand its compact level buttons. Click a level for rewards and bosses. The Normal/MAX difficulty setting persists while browsing levels (until refresh). New chapters appear automatically when added to `levels.json`.

**Features:** Card information stays visible. Click the feature's image if you want to see the image larger; the entire card does not navigate anywhere.

**Roblox stats:** The existing Cloudflare Worker and `src/config.ts` remain unchanged. If the numbers show dashes, check the Worker URL and browser console; the website does not invent counts.

## Preview changes locally
Open a VS Code terminal in the project directory and run `npm.cmd run dev`. Open the displayed localhost URL. Save any edited files with Ctrl+S; the site updates in the browser. This **does not publish** changes.

## Publish only when you decide
From a separate VS Code terminal (same project folder), run these commands one at a time:

```powershell
npm.cmd run build
git status
git add .
git commit -m "Update Five TDs content"
git push
```

`npm.cmd run build` should finish successfully before committing. `git push` uploads your committed changes to the `main` branch; the existing GitHub Actions Pages workflow deploys them automatically. Check the Actions tab and then `https://haystack13yt.github.io/FiveTDs/`. If Git says there is nothing to commit, nothing changed or you forgot to save. **Do not push** until you are ready for public updates.

## Data questions to verify in Roblox Studio
- Endo 02: `damage` contains `0.90 → 0.8` and is displayed as a **speed multiplier**, not direct damage.
- Withered Chica: `damage` contains `1.05 → 1.15` and is displayed as a **range multiplier**, not direct damage.
- **Fire Rate** is hits per second. Higher values mean faster attacks.
- Multi-level **Cost** values are stored as given, with the first as placement cost and the rest as level costs; confirm if they are incremental or cumulative.


## Live Roblox statistics

The Home page's statistics come from a Cloudflare Worker. See `ROBLOX_STATS_SETUP.md`
for the setup steps. Change the Worker URL in `src/config.ts` if needed.
The Worker source is stored in `worker/roblox-stats.js` so it can be
maintained alongside the rest of your website.
