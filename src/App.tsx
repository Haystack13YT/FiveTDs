import { useEffect, useMemo, useState } from 'react'
import unitsData from './data/units.json'
import levelsData from './data/levels.json'
import featuresData from './data/features.json'
import './App.css'

type UnitLevel = { level: number; cost: number; damage: number; fireRate: number; range: number }
type Unit = {
  id: string; name: string; rarity: string; type: string; image: string
  capacity: number; obtainable: string; added: string; addedUpdate: string
  levels: UnitLevel[]
}
type Difficulty = 'normal' | 'max'
type RewardValues = { fazCoins: number; remnant: [number, number]; startingMoney: number }
type StoryLevel = { number: number; name: string; waves: number; boss: string | null; normal: RewardValues; max: RewardValues }
type EndlessLevel = { startingMoney: Record<Difficulty, number>; fazCoinsEveryTenWaves: number[]; fazCoinsAfterWave100: number; remnantEveryTenWaves: [number, number]; unitId: string; bosses: string[] }
type Chapter = { id: number; name: string; added: string; addedUpdate: string; levels: StoryLevel[]; endless: EndlessLevel | null }
type LevelsDatabase = { chapters: Chapter[] }
type Feature = { id: string; title: string; category: string; summary: string; details: string[]; image: string }
const units = unitsData as Unit[]
const levels = levelsData as LevelsDatabase
const features = featuresData as Feature[]
const gameUrl = 'https://www.roblox.com/games/119232593159524/Five-TDs'
const links = [
  { id: 'home', title: 'Home' },
  { id: 'units', title: 'Units' },
  { id: 'levels', title: 'Levels' },
  { id: 'features', title: 'Features' },
]
const rarityColor: Record<string, string> = {
  Common: '#a7b7c9', Uncommon: '#65e7a5', Rare: '#60b8ff', Epic: '#c98cff', Legendary: '#ffcf65', Exclusive: '#fa8c79',
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash || 'home'
}
function navigate(route: string) {
  window.location.hash = `/${route}`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat"><span className="stat-number">{value}</span><span className="muted small">{label}</span></div>
}
function UnitArt({ unit, large = false }: { unit: Unit; large?: boolean }) {
  return <div className={`unit-art ${large ? 'unit-art-large' : ''}`} style={{ '--rarity': rarityColor[unit.rarity] || '#a7b7c9' } as React.CSSProperties}>
    {unit.image ? <img src={`${import.meta.env.BASE_URL}${unit.image.replace(/^\//, '')}`} alt={unit.name} /> : <span aria-hidden="true">◆</span>}
  </div>
}
function UnitCard({ unit }: { unit: Unit }) {
  return <button type="button" className="unit-card" onClick={() => navigate(`units/${unit.id}`)}>
    <UnitArt unit={unit} />
    <div className="unit-card-body"><span className="rarity" style={{ color: rarityColor[unit.rarity] || '#cbd5e1' }}>{unit.rarity}</span><h3>{unit.name}</h3><span className="muted small">{unit.type} · {unit.levels.length} levels</span></div>
    <span className="card-arrow">↗</span>
  </button>
}
function SectionHeader({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{detail && <p className="muted">{detail}</p>}</div>
}
function Home() {
  return <>
    <section className="hero container">
      <div className="hero-copy"><div className="pill"><span className="live-dot" /> THE OFFICIAL GAME HUB</div>
        <p className="eyebrow">DEFEND · DEPLOY · UPGRADE</p>
        <h1>FIVE <em>TD'S</em><span className="title-spark">✳</span></h1>
        <p className="hero-description">Explore units, maps, and game features. Find the information you need, then jump into the action on Roblox.</p>
        <div className="hero-actions"><a className="btn btn-primary" href={gameUrl} target="_blank" rel="noreferrer">▶ &nbsp; PLAY ON ROBLOX <span>↗</span></a><button className="btn btn-outline" onClick={() => navigate('units')}>EXPLORE UNITS →</button></div>
      </div>
      <div className="hero-graphic" aria-label="Stylized tower defense illustration"><div className="graphic-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="center-cube">5<span>TD</span></div><div className="graphic-caption">DEFENSE SYSTEM // ONLINE</div><div className="corner-mark">✳</div></div>
    </section>
    <section className="stats-wrap"><div className="container stats-bar"><div className="stats-intro"><span className="eyebrow">LIVE GAME DATA</span><strong>By the numbers</strong></div><Stat label="ACTIVE PLAYERS" value="—"/><Stat label="TOTAL VISITS" value="—"/><Stat label="FAVOURITES" value="—"/><div className="stats-note">Roblox stats integration<br/>coming soon</div></div></section>
    <section className="container content-section"><SectionHeader eyebrow="THE ROSTER" title="Meet the units" detail="Find the right defense for every wave."/><div className="unit-grid">{units.slice(0, 4).map(u => <UnitCard key={u.id} unit={u} />)}<button className="explore-card" onClick={() => navigate('units')}><span>↗</span><strong>ALL UNITS</strong><small>VIEW DATABASE →</small></button></div></section>
    <section className="container home-lower"><div className="feature-panel"><p className="eyebrow">MAP INTEL</p><h2>Know your<br/><em>battlefield.</em></h2><p>Explore stages and difficulties before your next run.</p><button className="text-link" onClick={() => navigate('levels')}>VIEW LEVELS <span>→</span></button><div className="feature-decor">▦</div></div><div className="update-panel"><p className="eyebrow">GAME SYSTEMS</p><h2>Explore game<br/>features</h2><p>Discover how summoning, quests, loadouts and more work in Five TD's.</p><button className="text-link" onClick={() => navigate('features')}>EXPLORE FEATURES <span>→</span></button><span className="update-panel-decor">✳</span></div></section>
  </>
}
function Units() {
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState('All')
  const rarities = useMemo(() => ['All', ...new Set(units.map(u => u.rarity))], [])
  const matches = units.filter(u => (rarity === 'All' || u.rarity === rarity) && `${u.name} ${u.type} ${u.obtainable}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="container page-content"><SectionHeader eyebrow="THE DATABASE / 01" title="Units" detail="Browse every unit in Five TD's."/><div className="filters"><label className="search-wrap"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search units..." aria-label="Search units" /></label><select aria-label="Filter by rarity" value={rarity} onChange={e => setRarity(e.target.value)}>{rarities.map(r => <option key={r} value={r}>{r === 'All' ? 'All rarities' : r}</option>)}</select><span className="muted count">{matches.length} UNIT{matches.length === 1 ? '' : 'S'}</span></div><div className="unit-grid">{matches.map(u => <UnitCard key={u.id} unit={u} />)}</div>{!matches.length && <div className="empty-state">No units matched your search.</div>}</div>
}
function formatAdded(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' })
}
function UnitDetails({ id }: { id: string }) {
  const unit = units.find(u => u.id === id)
  if (!unit) return <div className="container page-content"><p>Unit not found.</p><button className="text-link" onClick={() => navigate('units')}>← Back to units</button></div>
  const base = unit.levels[0]
  return <div className="container page-content">
    <button className="back-link" onClick={() => navigate('units')}>← ALL UNITS</button>
    <div className="detail-layout"><UnitArt unit={unit} large /><div className="detail-copy">
      <p className="eyebrow">UNIT FILE / {unit.id.toUpperCase()}</p><h1>{unit.name}</h1>
      <span className="rarity" style={{ color: rarityColor[unit.rarity] || '#cbd5e1' }}>{unit.rarity} · {unit.type}</span>
      <div className="detail-stats"><Stat label="BASE DAMAGE / EFFECT" value={base.damage.toLocaleString()} /><Stat label="BASE FIRE RATE" value={base.fireRate.toString()} /><Stat label="BASE RANGE" value={base.range.toString()} /><Stat label="PLACEMENT COST" value={base.cost.toLocaleString()} /></div>
      <p className="unit-extra">Capacity: <strong>{unit.capacity}</strong></p>
      <p className="unit-extra">Obtainable: <strong>{unit.obtainable}</strong></p>
      <p className="unit-extra">Added: <strong>{formatAdded(unit.added)} ({unit.addedUpdate})</strong></p>
      <p className="unit-extra">Total levels: <strong>{unit.levels.length}</strong></p>
    </div></div>
    <div className="table-panel"><h2>Stats by level</h2>
      <div className="table-scroll"><table><thead><tr><th>LEVEL</th><th>COST</th><th>{unit.type === 'Speed Debuff' ? 'SPEED MULTIPLIER' : unit.type === 'Range Buff' ? 'RANGE MULTIPLIER' : 'DAMAGE'}</th><th>RANGE</th><th>FIRE RATE</th></tr></thead>
      <tbody>{unit.levels.map(l => <tr key={l.level}><td>{l.level}</td><td>{l.cost.toLocaleString()}</td><td>{l.damage}</td><td>{l.range}</td><td>{l.fireRate}</td></tr>)}</tbody></table></div>
      <p className="table-caption">Level 1 cost is the initial placement cost. Later costs are listed exactly as provided.</p>
    </div>
  </div>
}
function RangeValue({ bounds }: { bounds: [number, number] }) {
  return <>{bounds[0] === bounds[1] ? bounds[0] : `${bounds[0]}–${bounds[1]}`}</>
}
function DifficultyToggle({ difficulty, onChange }: { difficulty: Difficulty; onChange: (value: Difficulty) => void }) {
  return <div className="difficulty-toggle" aria-label="Level difficulty"><span className="muted difficulty-label">DIFFICULTY</span>
    <div className="difficulty-options" role="group" aria-label="Choose difficulty">
      <button type="button" aria-pressed={difficulty === 'normal'} className={difficulty === 'normal' ? 'selected' : ''} onClick={() => onChange('normal')}>NORMAL</button>
      <button type="button" aria-pressed={difficulty === 'max'} className={difficulty === 'max' ? 'selected' : ''} onClick={() => onChange('max')}>MAX</button>
    </div>
  </div>
}
function Levels({ difficulty, onDifficultyChange }: { difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void }) {
  return <div className="container page-content">
    <SectionHeader eyebrow="THE DATABASE / 02" title="Levels" detail="Explore chapters, stages and their rewards." />
    <DifficultyToggle difficulty={difficulty} onChange={onDifficultyChange} />
    {levels.chapters.map(chapter => <section className="chapter-section" key={chapter.id}>
      <div className="chapter-heading"><div><p className="eyebrow">CHAPTER {chapter.id}</p><h2>{chapter.name}</h2><p className="muted">Added {formatAdded(chapter.added)} · {chapter.addedUpdate} · {chapter.levels.length} levels</p></div></div>
      <div className="level-grid">{chapter.levels.map(level => <button type="button" className="level-card level-card-button" key={level.number} onClick={() => navigate(`levels/${chapter.id}/${level.number}`)}>
        <div className="level-card-top"><span className="level-number">{chapter.id}-{level.number}</span><span className="muted small">{level.waves} WAVES</span></div>
        <div className="level-info"><h3>{level.name}</h3><p className="muted">Boss: {level.boss ?? 'None'}</p><div className="level-meta"><span>{level[difficulty].fazCoins} FAZCOINS</span><span><RangeValue bounds={level[difficulty].remnant} /> REMNANT</span><span className="level-go">VIEW →</span></div></div>
      </button>)}
      {chapter.endless && <button type="button" className="level-card level-card-button endless-card" onClick={() => navigate(`levels/${chapter.id}/endless`)}>
        <div className="level-card-top"><span className="level-number">{chapter.id}-∞</span><span className="muted small">ENDLESS WAVES</span></div>
        <div className="level-info"><h3>Endless</h3><p className="muted">Earn rewards every 10 waves.</p><div className="level-meta"><span>{chapter.endless.startingMoney[difficulty]} STARTING MONEY</span><span className="level-go">VIEW →</span></div></div>
      </button>}</div>
    </section>)}
  </div>
}
function LevelDetails({ chapterId, levelId, difficulty, onDifficultyChange }: { chapterId: string; levelId: string; difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void }) {
  const chapter = levels.chapters.find(c => String(c.id) === chapterId)
  const stage = chapter?.levels.find(l => String(l.number) === levelId)
  const endless = levelId === 'endless' ? chapter?.endless : null
  if (!chapter || (!stage && !endless)) return <div className="container page-content"><p>Level not found.</p><button className="back-link" onClick={() => navigate('levels')}>← ALL LEVELS</button></div>
  const unit = endless ? units.find(u => u.id === endless.unitId) : null
  return <div className="container page-content">
    <button className="back-link" onClick={() => navigate('levels')}>← ALL LEVELS</button>
    <SectionHeader eyebrow={`CHAPTER ${chapter.id} / ${chapter.name.toUpperCase()}`} title={stage ? `${chapter.id}-${stage.number} · ${stage.name}` : `${chapter.id}-Endless`} />
    <DifficultyToggle difficulty={difficulty} onChange={onDifficultyChange} />
    {stage ? <div className="level-detail-panels">
      <div className="table-panel level-detail-main"><h2>Level information</h2><div className="level-facts">
        <Stat label="FAZCOINS" value={stage[difficulty].fazCoins.toLocaleString()} />
        <Stat label="REMNANT" value={stage[difficulty].remnant[0] === stage[difficulty].remnant[1] ? String(stage[difficulty].remnant[0]) : stage[difficulty].remnant.join('–')} />
        <Stat label="STARTING MONEY" value={stage[difficulty].startingMoney.toLocaleString()} />
        <Stat label="WAVES" value={String(stage.waves)} />
      </div><p className="unit-extra">Boss: <strong>{stage.boss ?? 'None'}</strong></p></div>
    </div> : endless && <div className="endless-detail">
      <div className="level-facts endless-facts"><Stat label="STARTING MONEY" value={endless.startingMoney[difficulty].toLocaleString()} /><Stat label="REMNANT / 10 WAVES" value={`${endless.remnantEveryTenWaves[0]}–${endless.remnantEveryTenWaves[1]}`} /><Stat label="WAVES" value="Unlimited" /></div>
      <div className="table-panel"><h2>FazCoins by wave</h2><p className="muted">Awarded every 10 waves. Rewards are the same in Normal and MAX.</p><div className="table-scroll"><table><thead><tr><th>WAVE REACHED</th><th>FAZCOINS REWARDED</th></tr></thead><tbody>
        {endless.fazCoinsEveryTenWaves.map((coins, i) => <tr key={i}><td>{(i + 1) * 10}</td><td>{coins.toLocaleString()}</td></tr>)}
        <tr><td>110, 120, 130, …</td><td>{endless.fazCoinsAfterWave100.toLocaleString()} each 10 waves</td></tr>
      </tbody></table></div><p className="table-caption">Remnant is randomly awarded within the listed range every 10 waves.</p></div>
      <div className="table-panel"><h2>Possible unit reward</h2>{unit ? <button type="button" className="endless-unit-link" onClick={() => navigate(`units/${unit.id}`)}><UnitArt unit={unit} /><span><strong>{unit.name}</strong><small>VIEW UNIT →</small></span></button> : <p className="muted">{endless.unitId}</p>}</div>
      <div className="table-panel"><h2>Bosses</h2><ul className="endless-boss-list">{endless.bosses.map(boss => <li key={boss}>{boss}</li>)}</ul></div>
    </div>}
  </div>
}
function Features() {
  return <div className="container page-content"><SectionHeader eyebrow="THE DATABASE / 03" title="Features" detail="A starting guide to Five TD's game systems. More detail can be added anytime." />
    <div className="feature-grid">{features.map(feature => <article className="feature-card" key={feature.id}>
      <div className="feature-card-media">{feature.image ? <img src={`${import.meta.env.BASE_URL}${feature.image.replace(/^\//, '')}`} alt={feature.title} /> : <span>✳</span>}</div>
      <div className="feature-card-copy"><p className="eyebrow">{feature.category}</p><h3>{feature.title}</h3><p className="muted">{feature.summary}</p><ul>{feature.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div>
    </article>)}</div>
  </div>
}
function App() {
  const [route, setRoute] = useState(getRoute)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [levelDifficulty, setLevelDifficulty] = useState<Difficulty>('normal')
  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); setMobileOpen(false) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const current = route.split('/')[0]
  return <div className="site"><header className="site-header"><div className="container header-inner"><a className="brand" href="#/home" aria-label="Five TD's home"><span className="brand-icon">5<span>✳</span></span><span>FIVE <b>TD'S</b><small>OFFICIAL WIKI</small></span></a><nav className={mobileOpen ? 'nav nav-open' : 'nav'} aria-label="Main navigation">{links.map(link => <a href={`#/${link.id}`} key={link.id} className={current === link.id ? 'active' : ''}>{link.title}</a>)}</nav><div className="header-actions"><a className="header-play" href={gameUrl} target="_blank" rel="noreferrer">PLAY GAME ↗</a><button className="mobile-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? '✕' : '☰'}</button></div></div></header><main>{route.startsWith('units/') ? <UnitDetails id={route.slice('units/'.length)} /> : current === 'units' ? <Units /> : route.startsWith('levels/') ? <LevelDetails chapterId={route.split('/')[1]} levelId={route.split('/')[2]} difficulty={levelDifficulty} onDifficultyChange={setLevelDifficulty} /> : current === 'levels' ? <Levels difficulty={levelDifficulty} onDifficultyChange={setLevelDifficulty} /> : current === 'features' ? <Features /> : <Home />}</main><footer className="footer"><div className="container footer-inner"><div><strong>FIVE <span>TD'S</span></strong><p>The community companion for Five TD's on Roblox.</p></div><div className="footer-links">{links.map(link => <a key={link.id} href={`#/${link.id}`}>{link.title}</a>)}</div><span className="muted small">© {new Date().getFullYear()} Five TD's</span></div></footer></div>
}
export default App
