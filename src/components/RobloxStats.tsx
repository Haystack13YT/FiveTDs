import { useEffect, useState } from 'react'
import { ROBLOX_STATS_API_URL } from '../config'

type Stats = {
  playing: number | null
  visits: number | null
  favorites: number | null
  ratingPercent: number | null
  updatedAt: string
}

type LoadState = 'setup' | 'loading' | 'live' | 'error'

const configured = ROBLOX_STATS_API_URL.startsWith('https://')
  && !ROBLOX_STATS_API_URL.includes('YOUR-WORKER')
  && !ROBLOX_STATS_API_URL.includes('YOUR-SUBDOMAIN')

function isValidCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function validateStats(payload: unknown): Stats {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid statistics response')
  const candidate = payload as Partial<Stats>
  if (!isValidCount(candidate.playing) || !isValidCount(candidate.visits)) {
    throw new Error('Roblox returned missing game data')
  }
  return {
    playing: candidate.playing,
    visits: candidate.visits,
    favorites: isValidCount(candidate.favorites) ? candidate.favorites : null,
    ratingPercent: isValidCount(candidate.ratingPercent) && candidate.ratingPercent <= 100 ? candidate.ratingPercent : null,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : '',
  }
}

function displayCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString() : '—'
}

export default function RobloxStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [state, setState] = useState<LoadState>(configured ? 'loading' : 'setup')

  useEffect(() => {
    if (!configured) return
    const controller = new AbortController()
    let mounted = true

    async function refresh() {
      try {
        const response = await fetch(ROBLOX_STATS_API_URL, { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error(`Statistics request failed: ${response.status}`)
        const payload: unknown = await response.json()
        const data = validateStats(payload)
        if (mounted) {
          setStats(data)
          setState('live')
        }
      } catch (error) {
        if (mounted) {
          console.warn('Five TDs stats update failed', error)
          setState('error')
        }
      }
    }

    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 60_000)
    return () => { mounted = false; window.clearInterval(timer); controller.abort() }
  }, [])

  const lastChecked = stats?.updatedAt && !Number.isNaN(Date.parse(stats.updatedAt))
    ? new Date(stats.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null

  const message = state === 'setup'
    ? 'Setup required: add your Cloudflare Worker URL in src/config.ts.'
    : state === 'loading'
      ? 'Loading Roblox statistics…'
      : state === 'error'
        ? stats ? 'Roblox unavailable; showing last retrieved data. Retrying automatically.' : 'Roblox statistics unavailable. Retrying automatically.'
        : `Roblox data · refreshes about every minute${lastChecked ? ` · checked ${lastChecked}` : ''}`

  return (
    <section className="stats-wrap" aria-label="Roblox game statistics">
      <div className="container stats-bar">
        <div className="stats-intro"><span className="eyebrow">LIVE GAME DATA</span><strong>By the numbers</strong></div>
        <div className="stat"><span className="stat-number">{displayCount(stats?.playing)}</span><span className="muted small">ACTIVE PLAYERS</span></div>
        <div className="stat"><span className="stat-number">{displayCount(stats?.visits)}</span><span className="muted small">TOTAL VISITS</span></div>
        <div className="stat"><span className="stat-number">{displayCount(stats?.favorites)}</span><span className="muted small">FAVOURITES</span></div>
        <div className="stat"><span className="stat-number">{stats?.ratingPercent == null ? '—' : `${stats.ratingPercent}%`}</span><span className="muted small">APPROVAL RATING</span></div>
        <div className="stats-note" aria-live="polite">{message}</div>
      </div>
    </section>
  )
}
