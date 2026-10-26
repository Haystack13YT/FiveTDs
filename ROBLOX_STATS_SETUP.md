# Five TD's live Roblox stats setup

The Home page now has four dynamic statistics: active players, visits, favorites, and approval rating.
The values are retrieved from public Roblox API endpoints through a Cloudflare Worker.
No Roblox password, cookie, API token, or paid account is required.

## Part A — Publish the Worker

1. Create/sign into a Cloudflare account at https://dash.cloudflare.com/.
2. Choose **Workers & Pages → Create application** (the interface may say **Create**).
3. Create a Worker from the default Hello World template; name it **fivetds-stats**.
4. Open **Edit code** for that Worker. Replace all template code with the contents of `worker/roblox-stats.js`.
5. Click **Deploy**, or **Save and deploy**.
6. Visit the published Worker URL in a browser. It resembles
   `https://fivetds-stats.YOUR-CLOUDFLARE-SUBDOMAIN.workers.dev`.
7. It should return JSON including `playing`, `visits`, `favorites`, `ratingPercent`, and `updatedAt`.
   If it returns a JSON error with 503 status, Roblox may be blocking requests or
   an endpoint may have changed. Do not use dummy numbers on the public site.

## Part B — Link your React site to the Worker

1. In VS Code, open `src/config.ts`.
2. Replace `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev` with the **exact**
   deployed Worker URL. Keep the quotation marks.
3. Run `npm.cmd run dev` locally. Open the Home page and check the stats.
4. If stats remain blank, open browser Developer Tools (F12) → Console and
   check for request failures. Directly visit the Worker URL to isolate errors.

## Part C — Publish when you choose

Run in a second VS Code terminal:

```powershell
npm.cmd run build
git add .
git commit -m "Add live Roblox game statistics"
git push
```

GitHub Actions then deploys the site. The Worker is deployed independently
through the Cloudflare dashboard; changing Worker code does not require a
GitHub push.

## How it works

- The Worker converts the game's **Place ID** (119232593159524) into the
  experience's **Universe ID** using a public Roblox endpoint.
- It queries `games.roblox.com` for concurrent players, lifetime visits, and favorites.
- It queries Roblox game votes for approval percentage (upvotes / total votes).
- It keeps a best-effort 60-second cache per running Worker instance. The website checks once
  a minute while open. Statistics are near-live, not instantaneous.
- The website shows dashes for missing information and a visible status when
  Roblox returns an error, instead of inventing numbers.
- Only `https://haystack13yt.github.io` and local development pages are
  allowed browser CORS access. Edit `SITE_ORIGIN` in `worker/roblox-stats.js`
  if you later move to a custom domain.
- If no votes have been cast, the approval rating is shown as a dash.

## If something goes wrong

- **Setup required**: the Worker URL still has the placeholder in `src/config.ts`.
- **503 from Worker**: Roblox may have blocked requests, rate-limited the
  Worker, or modified an endpoint. Check Cloudflare Worker Logs.
- **CORS error**: verify the website origin and the Worker deployment; ensure
  you pasted the full Worker file, not just a partial snippet.
- **Worker JSON loads but website dashes**: check that `src/config.ts` has the
  right URL and restart the development server if required.

The integration uses public, unauthenticated Roblox endpoints. Their behavior
is controlled by Roblox and may change.
