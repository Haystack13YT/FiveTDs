import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import unitsData from './data/units.json'
import levelsData from './data/levels.json'
import featuresData from './data/features.json'
import RobloxStats from './components/RobloxStats'
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
type Feature = { id: string; title: string; image: string; accessed: string; added: string; addedUpdate?: string; details: string[] }

const units = unitsData as Unit[]
const levels = levelsData as LevelsDatabase
const features = featuresData as Feature[]
const gameUrl = 'https://www.roblox.com/games/119232593159524/Five-TDs'
const baseUrl = import.meta.env.BASE_URL
const asset = (path: string) => `${baseUrl}${path.replace(/^\//, '')}`
const links = ['Home', 'Units', 'Levels', 'Features']
const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Exclusive', 'Legendary'] as const
const rarityColor: Record<string, string> = {
  Common: '#a9b3c5', Uncommon: '#65cf9d', Rare: '#63a5ff', Epic: '#b58aff',
  Exclusive: '#ee88b9', Legendary: '#ffce6a',
}

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '') || 'home'
}
function navigate(route: string, scroll = true) {
  window.location.hash = `/${route}`
  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' })
}
function formatAdded(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric',
  })
}
function rangeLabel(bounds: [number, number]) {
  return bounds[0] === bounds[1] ? String(bounds[0]) : `${bounds[0]}–${bounds[1]}`
}
function UnitArt({ unit, large = false }: { unit: Unit; large?: boolean }) {
  return <span className={`unit-art ${large ? 'unit-art-large' : ''}`} style={{ '--rarity': rarityColor[unit.rarity] || '#a9b3c5' } as CSSProperties}>
    {unit.image ? <img src={asset(unit.image)} alt="" loading={large ? 'eager' : 'lazy'} /> : <span className="no-image">{unit.name}</span>}
  </span>
}
function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="page-heading"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
}

function Home() {
  const featured = ['freddy', 'bonnie', 'chica', 'foxy', 'golden-freddy']
    .map(id => units.find(unit => unit.id === id)).filter((unit): unit is Unit => Boolean(unit))
  return <>
    <section className="home-hero" aria-label="Five TD's">
      <img className="home-hero-photo" src={asset('general/Thumbnail2.jpg')} alt="Five TD's game characters" />
      <div className="home-hero-shade" />
      <div className="home-hero-content container">
        <img className="hero-logo" src={asset('general/Logo-Cropped.png')} alt="Five TD's" />
        <p>The Five TD's companion site</p>
        <a className="button button-primary" href={gameUrl} target="_blank" rel="noreferrer">Play on Roblox</a>
      </div>
    </section>
    <RobloxStats />
    <section className="container home-section">
      <div className="simple-section-title"><h2>Explore the game</h2></div>
      <div className="explore-grid">
        <button type="button" className="explore-tile explore-units" onClick={() => navigate('units')}>
          <span className="explore-unit-images" aria-hidden="true">
            {featured.slice(0, 3).map(unit => <img key={unit.id} src={asset(unit.image)} alt="" />)}
          </span>
          <span className="explore-name">Units</span>
        </button>
        <button type="button" className="explore-tile" onClick={() => navigate('levels')}>
          <img className="explore-cover" src={asset('general/Thumbnail1.jpg')} alt="" />
          <span className="explore-name">Levels</span>
        </button>
        <button type="button" className="explore-tile" onClick={() => navigate('features')}>
          <img className="explore-cover" src={asset('features/Summons.jpg')} alt="" />
          <span className="explore-name">Features</span>
        </button>
      </div>
    </section>
    <section className="container home-section featured-section">
      <div className="simple-section-title"><h2>Featured units</h2><button type="button" className="quiet-link" onClick={() => navigate('units')}>View all</button></div>
      <div className="featured-units">
        {featured.map(unit => <button key={unit.id} type="button" title={unit.name} aria-label={`View ${unit.name}`} onClick={() => navigate(`units/${unit.id}`)}>
          <UnitArt unit={unit} />
        </button>)}
      </div>
    </section>
  </>
}

function UnitIcon({ unit }: { unit: Unit }) {
  return <button type="button" className="unit-icon-button" onClick={() => navigate(`units/${unit.id}`, false)} title={unit.name} aria-label={`View ${unit.name}`}>
    <UnitArt unit={unit} />
  </button>
}

function UnitModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (dialog.open) dialog.close()
    }
  }, [])
  const effectName = unit.type === 'Speed Debuff' ? 'Speed multiplier' : unit.type === 'Range Buff' ? 'Range multiplier' : 'Damage'
  return <dialog ref={dialogRef} className="unit-modal" aria-labelledby="unit-modal-title" onClose={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="modal-inner">
      <div className="modal-top"><span style={{ color: rarityColor[unit.rarity] }}>{unit.rarity}</span><button type="button" className="close-button" onClick={onClose} aria-label="Close unit details">Close</button></div>
      <div className="modal-unit-header">
        <UnitArt unit={unit} large />
        <div className="modal-unit-info">
          <h2 id="unit-modal-title">{unit.name}</h2>
          <dl className="unit-meta">
            <div><dt>Type</dt><dd>{unit.type}</dd></div>
            <div><dt>Capacity</dt><dd>{unit.capacity}</dd></div>
            <div><dt>Obtained</dt><dd>{unit.obtainable}</dd></div>
            <div><dt>Added</dt><dd>{formatAdded(unit.added)}</dd></div>
            <div><dt>Update</dt><dd>{unit.addedUpdate || '—'}</dd></div>
            <div><dt>Levels</dt><dd>{unit.levels.length}</dd></div>
          </dl>
        </div>
      </div>
      <section className="unit-levels"><h3>Stats by level</h3><div className="table-scroll"><table>
        <thead><tr><th>Level</th><th>Cost</th><th>{effectName}</th><th>Range</th><th>Hits/sec</th></tr></thead>
        <tbody>{unit.levels.map(level => <tr key={level.level}><td>{level.level}</td><td>{level.cost.toLocaleString()}</td><td>{level.damage}</td><td>{level.range}</td><td>{level.fireRate}</td></tr>)}</tbody>
      </table></div><p className="table-note">Level 1 cost is the placement cost.</p></section>
    </div>
  </dialog>
}

function Units({ selectedUnitId }: { selectedUnitId?: string }) {
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase()
  const groups = useMemo(() => rarityOrder.map(rarity => ({
    rarity,
    matches: units.filter(unit => unit.rarity === rarity && `${unit.name} ${unit.type} ${unit.obtainable}`.toLocaleLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(group => group.matches.length > 0), [search])
  const selectedUnit = units.find(unit => unit.id === selectedUnitId)
  return <div className="container page-content units-page">
    <PageTitle title="Units" />
    <div className="units-toolbar"><input className="search-input" type="search" placeholder="Search units..." value={query} onChange={e => setQuery(e.target.value)} aria-label="Search units" />
      <span>{groups.reduce((sum, group) => sum + group.matches.length, 0)} units</span>
    </div>
    {groups.length ? groups.map(group => <section className="rarity-section" key={group.rarity}>
      <div className="rarity-title"><h2 style={{ color: rarityColor[group.rarity] }}>{group.rarity}</h2><span>{group.matches.length}</span></div>
      <div className="unit-icon-grid">{group.matches.map(unit => <UnitIcon key={unit.id} unit={unit} />)}</div>
    </section>) : <p className="empty-message">No units found.</p>}
    {selectedUnitId && (selectedUnit ? <UnitModal key={selectedUnit.id} unit={selectedUnit} onClose={() => navigate('units', false)} /> : <p className="empty-message">Unit not found. <button type="button" className="quiet-link" onClick={() => navigate('units', false)}>Close</button></p>)}
  </div>
}

function DifficultyToggle({ difficulty, onChange }: { difficulty: Difficulty; onChange: (value: Difficulty) => void }) {
  return <div className="difficulty-toggle"><span>Difficulty</span><div className="difficulty-options" role="group" aria-label="Level difficulty">
    <button type="button" aria-pressed={difficulty === 'normal'} className={difficulty === 'normal' ? 'active' : ''} onClick={() => onChange('normal')}>Normal</button>
    <button type="button" aria-pressed={difficulty === 'max'} className={difficulty === 'max' ? 'active' : ''} onClick={() => onChange('max')}>MAX</button>
  </div></div>
}

function Levels({ difficulty, onDifficultyChange, expanded, onToggle }: {
  difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void
  expanded: number[]; onToggle: (id: number) => void
}) {
  return <div className="container page-content levels-page">
    <PageTitle title="Levels" />
    <DifficultyToggle difficulty={difficulty} onChange={onDifficultyChange} />
    <div className="chapters-list">{levels.chapters.map(chapter => {
      const open = expanded.includes(chapter.id)
      return <section className={`chapter-box ${open ? 'chapter-open' : ''}`} key={chapter.id}>
        <button type="button" className="chapter-trigger" aria-expanded={open} aria-controls={`chapter-levels-${chapter.id}`} onClick={() => onToggle(chapter.id)}>
          <span className="chapter-id">Chapter {chapter.id}</span><span className="chapter-description"><strong>{chapter.name}</strong><small>{chapter.levels.length} levels{chapter.endless ? ' + endless' : ''} · {formatAdded(chapter.added)}</small></span><span className="chapter-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        {open && <div className="chapter-content" id={`chapter-levels-${chapter.id}`}>
          <div className="compact-level-grid">{chapter.levels.map(level => <button type="button" className="compact-level" key={level.number} onClick={() => navigate(`levels/${chapter.id}/${level.number}`)}>
            <strong>{chapter.id}-{level.number}</strong><span>{level.name}</span><small>{level.waves} waves</small>
          </button>)}
            {chapter.endless && <button type="button" className="compact-level endless-level" onClick={() => navigate(`levels/${chapter.id}/endless`)}><strong>{chapter.id}-Endless</strong><span>Endless</span><small>Unlimited waves</small></button>}
          </div>
          <p className="chapter-hint">Select a level to see rewards, starting money and bosses in {difficulty === 'normal' ? 'Normal' : 'MAX'} mode.</p>
        </div>}
      </section>
    })}</div>
  </div>
}

function Reward({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return <div className="reward-stat">{icon && <img src={asset(`general/${icon}`)} alt="" />}
    <span><small>{label}</small><strong>{value}</strong></span>
  </div>
}
function LevelDetails({ chapterId, levelId, difficulty, onDifficultyChange }: { chapterId: string; levelId: string; difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void }) {
  const chapter = levels.chapters.find(item => String(item.id) === chapterId)
  const stage = chapter?.levels.find(item => String(item.number) === levelId)
  const endless = levelId === 'endless' ? chapter?.endless : null
  if (!chapter || (!stage && !endless)) return <div className="container page-content"><PageTitle title="Level not found" /><button className="quiet-link" onClick={() => navigate('levels')}>Back to levels</button></div>
  const unit = endless ? units.find(item => item.id === endless.unitId) : null
  return <div className="container page-content level-detail">
    <button type="button" className="quiet-link back-link" onClick={() => navigate('levels')}>Back to levels</button>
    <PageTitle title={stage ? `${chapter.id}-${stage.number} ${stage.name}` : `${chapter.id}-Endless`} subtitle={`Chapter ${chapter.id} · ${chapter.name}`} />
    <DifficultyToggle difficulty={difficulty} onChange={onDifficultyChange} />
    {stage ? <>
      <div className="reward-grid">
        <Reward icon="FazCoinIcon.png" label="FazCoins" value={String(stage[difficulty].fazCoins)} />
        <Reward icon="RemnantIcon.png" label="Remnant" value={rangeLabel(stage[difficulty].remnant)} />
        <Reward label="Starting money" value={String(stage[difficulty].startingMoney)} />
        <Reward label="Waves" value={String(stage.waves)} />
      </div>
      <div className="level-boss"><span>Boss</span><strong>{stage.boss ?? 'None'}</strong></div>
    </> : endless && <>
      <div className="reward-grid">
        <Reward label="Starting money" value={String(endless.startingMoney[difficulty])} />
        <Reward icon="RemnantIcon.png" label="Remnant every 10 waves" value={rangeLabel(endless.remnantEveryTenWaves)} />
        <Reward label="Waves" value="Unlimited" />
      </div>
      <section className="data-panel"><h2>FazCoins every 10 waves</h2><div className="table-scroll"><table><thead><tr><th>Wave</th><th>FazCoins</th></tr></thead><tbody>
        {endless.fazCoinsEveryTenWaves.map((coins, index) => <tr key={index}><td>{(index + 1) * 10}</td><td>{coins}</td></tr>)}
        <tr><td>110 onward, every 10 waves</td><td>{endless.fazCoinsAfterWave100}</td></tr>
      </tbody></table></div><p className="table-note">Rewards are the same in both difficulties. Remnant is randomized every 10 waves.</p></section>
      <div className="endless-extra">
        <section className="data-panel"><h2>Possible unit</h2>{unit ? <button className="endless-unit" onClick={() => navigate(`units/${unit.id}`)} title={`View ${unit.name}`}><UnitArt unit={unit} /><span>{unit.name}</span></button> : <p>{endless.unitId}</p>}</section>
        <section className="data-panel"><h2>Bosses</h2><ul className="boss-list">{endless.bosses.map(boss => <li key={boss}>{boss}</li>)}</ul></section>
      </div>
    </>}
  </div>
}

function ImageViewer({ feature, onClose }: { feature: Feature; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])
  return <dialog className="image-viewer" ref={dialogRef} aria-label={`${feature.title} enlarged image`} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div><button type="button" className="close-button" onClick={onClose}>Close</button><img src={asset(feature.image)} alt={feature.title} /></div>
  </dialog>
}
function Features() {
  const [imageView, setImageView] = useState<Feature | null>(null)
  return <div className="container page-content features-page">
    <PageTitle title="Features" />
    <div className="feature-grid">{features.map(feature => <article className="feature-card" key={feature.id}>
      <button type="button" className="feature-card-media" onClick={() => setImageView(feature)} aria-label={`Enlarge ${feature.title} image`} title={`Enlarge ${feature.title} image`}>
        {feature.image ? <img src={asset(feature.image)} alt="" loading="lazy" /> : <span>No image</span>}
      </button>
      <div className="feature-card-content">
        <h2>{feature.title}</h2>
        <div className="feature-meta"><span>Accessed: {feature.accessed}</span><span>Added: {formatAdded(feature.added)}{feature.addedUpdate ? ` · ${feature.addedUpdate}` : ''}</span></div>
        <div className="feature-details">{feature.details.map((detail, index) => <p key={index}>{detail}</p>)}</div>
      </div>
    </article>)}</div>
    {imageView && <ImageViewer key={imageView.id} feature={imageView} onClose={() => setImageView(null)} />}
  </div>
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [expandedChapters, setExpandedChapters] = useState<number[]>([])
  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); setMobileOpen(false) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const current = route.split('/')[0]
  return <div className="site">
    <header className="site-header"><div className="container header-inner">
      <a className="brand" href="#/home" aria-label="Five TD's home"><img src={asset('general/Logo-Cropped.png')} alt="Five TD's" /></a>
      <nav className={mobileOpen ? 'nav nav-open' : 'nav'} aria-label="Main navigation">
        {links.map(link => <a key={link} href={`#/${link.toLowerCase()}`} className={current === link.toLowerCase() ? 'active' : ''} aria-current={current === link.toLowerCase() ? 'page' : undefined}>{link}</a>)}
      </nav>
      <div className="header-actions"><a className="header-play" href={gameUrl} target="_blank" rel="noreferrer">Play game</a><button type="button" className="mobile-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? 'Close' : 'Menu'}</button></div>
    </div></header>
    <main>{current === 'units' ? <Units selectedUnitId={route.startsWith('units/') ? route.slice(6) : undefined} />
      : route.startsWith('levels/') ? <LevelDetails chapterId={route.split('/')[1]} levelId={route.split('/')[2]} difficulty={difficulty} onDifficultyChange={setDifficulty} />
      : current === 'levels' ? <Levels difficulty={difficulty} onDifficultyChange={setDifficulty} expanded={expandedChapters} onToggle={id => setExpandedChapters(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])} />
      : current === 'features' ? <Features /> : <Home />}</main>
    <footer className="site-footer"><div className="container footer-inner"><span>Five TD's</span><span>Units, levels and features</span><a href={gameUrl} target="_blank" rel="noreferrer">Roblox</a></div></footer>
  </div>
}
export default App
