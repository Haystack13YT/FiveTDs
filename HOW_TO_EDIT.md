# Editing the Five TD's website

This site has four main sections: **Home**, **Units**, **Levels**, and **Updates**.

## Adding a unit (no React editing needed)

1. Open `src/data/units.json` in VS Code.
2. Copy one existing unit object, including its opening `{` and closing `}`.
3. Add a comma between objects. Set a **unique** `id` such as `freddy` (lowercase letters and hyphens are best).
4. Edit `name`, `rarity`, `type`, `damage`, `fireRate`, `range`, `cost`, `capacity`, `description`, and `obtainable`.
5. Save. The unit will automatically appear on the Units page, in search/filter results, and have its own details page.

Example:

```json
{
  "id": "example-unit",
  "name": "Example Unit",
  "rarity": "Rare",
  "type": "Splash",
  "description": "Example description.",
  "image": "units/example-unit.png",
  "damage": 25,
  "fireRate": 1.5,
  "range": 18,
  "cost": 450,
  "capacity": 4,
  "obtainable": "Summon",
  "upgrades": [
    { "level": 2, "damage": 40, "fireRate": 1.5, "range": 20, "cost": 300 }
  ]
}
```

**Images:** Add `example-unit.png` to `public/units/`. Create that folder if needed. In JSON use `"image": "units/example-unit.png"`. Leave it as `""` to display the placeholder icon.

**Unknown stats:** Set numerical values to `null`, instead of inventing numbers. **Rarities:** `Common`, `Uncommon`, `Rare`, `Epic`, `Legendary` have built-in colors. New rarity names also display.

## Adding a level

Edit `src/data/levels.json`. Copy an existing level entry. Give it a unique `id` and set name, chapter, description, difficulties, waves, boss, and optionally an image under `public/`.

## Posting an update

Edit `src/data/updates.json`. To add the first update, replace `[]` with:

```json
[
  {
    "id": "launch-notes",
    "title": "Website Launch",
    "date": "2026-10-18",
    "summary": "Our website is live!",
    "changes": ["Launched the wiki", "Added unit browsing"]
  }
]
```

Add future updates as additional objects with commas between entries. Put the newest update first; it is shown on the Home page.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

## Publish changes

```powershell
git add .
git commit -m "Update Five TDs website"
git push
```

GitHub Actions will build and publish to `https://haystack13yt.github.io/FiveTDs/`.

## Roblox statistics

The homepage deliberately displays em dashes (`—`) because live Roblox statistics need a reliable API proxy. It does **not** show invented numbers. We can connect a Cloudflare Worker in the next stage.
