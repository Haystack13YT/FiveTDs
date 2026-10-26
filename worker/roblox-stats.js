// Five TD's public Roblox statistics proxy for Cloudflare Workers.
// Paste the entire file into the Cloudflare Worker code editor, then Deploy.
// No API keys, Roblox cookies, or personal credentials are needed.

const PLACE_ID = '119232593159524'
const CACHE_SECONDS = 60
// Best-effort, per-isolate cache: also works on workers.dev.
let cachedStats = null
let cacheExpiresAt = 0
let inFlight = null
const SITE_ORIGIN = 'https://haystack13yt.github.io'

function allowedOrigin(origin) {
  if (origin === SITE_ORIGIN) return origin
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '')) return origin
  return null
}

function json(data, status = 200, origin = null, ttl = 0) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': ttl ? `public, max-age=${ttl}` : 'no-store',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  })
  if (origin) headers.set('Access-Control-Allow-Origin', origin)
  return new Response(JSON.stringify(data), { status, headers })
}

async function fetchJson(url, ttl) {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    cf: { cacheEverything: true, cacheTtl: ttl },
  })
  if (!response.ok) throw new Error(`Roblox returned HTTP ${response.status}`)
  return await response.json()
}

function countOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value : null
}

async function getStats() {
  const universe = await fetchJson(
    `https://apis.roblox.com/universes/v1/places/${PLACE_ID}/universe`, 86400,
  )
  const universeId = universe?.universeId
  if (!Number.isSafeInteger(universeId) || universeId <= 0) {
    throw new Error('Could not resolve the experience Universe ID')
  }

  const info = await fetchJson(
    `https://games.roblox.com/v1/games?universeIds=${universeId}`, CACHE_SECONDS,
  )
  const game = info?.data?.find((entry) => entry.id === universeId)
  if (!game || countOrNull(game.playing) === null || countOrNull(game.visits) === null) {
    throw new Error('Roblox returned no public statistics for this experience')
  }

  let ratingPercent = null
  try {
    const votes = await fetchJson(
      `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`, CACHE_SECONDS,
    )
    const vote = votes?.data?.find((entry) => entry.id === universeId)
    const up = countOrNull(vote?.upVotes)
    const down = countOrNull(vote?.downVotes)
    if (up !== null && down !== null && up + down > 0) {
      ratingPercent = Math.round((up / (up + down)) * 100)
    }
  } catch (error) {
    console.warn('Could not fetch Roblox votes:', String(error))
  }

  let favorites = countOrNull(game.favoritedCount)
  if (favorites === null) {
    try {
      const favData = await fetchJson(
        `https://games.roblox.com/v1/games/${universeId}/favorites/count`, CACHE_SECONDS,
      )
      favorites = countOrNull(favData?.favoritesCount)
    } catch (error) {
      console.warn('Could not fetch Roblox favorites:', String(error))
    }
  }

  return {
    playing: game.playing,
    visits: game.visits,
    favorites,
    ratingPercent,
    updatedAt: new Date().toISOString(),
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = allowedOrigin(request.headers.get('Origin'))
    const pathname = new URL(request.url).pathname
    if (pathname !== '/' && pathname !== '/stats') return json({ error: 'Not found' }, 404, origin)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      } })
    }
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, origin)

    // In-memory caching is scoped to this running Worker instance.
    // Other instances may refresh independently. It works on workers.dev.
    if (cachedStats && Date.now() < cacheExpiresAt) {
      return json(cachedStats, 200, origin, CACHE_SECONDS)
    }

    try {
      if (!inFlight) {
        inFlight = getStats().then((data) => {
          cachedStats = data
          cacheExpiresAt = Date.now() + CACHE_SECONDS * 1000
          return data
        }).finally(() => { inFlight = null })
      }
      const data = await inFlight
      return json(data, 200, origin, CACHE_SECONDS)
    } catch (error) {
      console.error('Roblox stats failed:', String(error))
      return json({ error: 'Roblox statistics are temporarily unavailable.' }, 503, origin)
    }
  },
}
