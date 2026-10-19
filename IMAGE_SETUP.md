# Unit images: where they go

All 28 unit images are already in `public/units/` and `src/data/units.json` now references them.

To change an image, put a PNG in `public/units/`, then change the corresponding `image` field in `src/data/units.json` to `units/Filename.png` (matching case).

Start a local preview with `npm.cmd run dev`. To publish changes, run `npm.cmd run build`, then `git add .`, `git commit -m "Update unit images"`, and `git push`.

The ZIP excludes the `.git` folder, node_modules, and dist. Copy its contents *into* your existing Git working folder, leaving your `.git` folder intact.
