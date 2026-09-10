import { useState } from 'react'

const ASSET_BASE = 'https://assets.clashk.ing'

function toSnakeCase(name) {
  if (!name) return ''
  return name
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Maps item kinds to their specific asset path structures:
 * - heroes:    /heroes/{name}/icon.webp
 * - pets:      /pets/{name}/icon.webp
 * - spells:    /spells/{name}.webp
 * - equipment: /equipment/{name}.webp
 * - townhall:  /buildings/home-village/town_hall/level_{level}.webp
 * - troops:    /troops/{name}/icon.webp
 */
function getItemUrl(kind, name, level) {
  const formattedName = toSnakeCase(name)

  switch (kind) {
    case 'hero':
      return `${ASSET_BASE}/heroes/${formattedName}/icon.webp`
    case 'pet':
      return `${ASSET_BASE}/pets/${formattedName}/icon.webp`
    case 'spell':
      return `${ASSET_BASE}/spells/${formattedName}.webp`
    case 'equipment':
      return `${ASSET_BASE}/equipment/${formattedName}.webp`
    
    case 'townhall': {
      const thLevel = level || name || 1
      return `${ASSET_BASE}/buildings/home-village/town_hall/level_${thLevel}.webp`
    }
    case 'troop':
    default:
      return `${ASSET_BASE}/troops/${formattedName}/icon.webp`
  }
}

function FallbackGlyph({ kind, name, village, className }) {
  const AIR = new Set([
    'Balloon', 'Dragon', 'Minion', 'Lava Hound', 'Baby Dragon', 'Electro Dragon',
    'Ice Hound', 'Dragon Rider', 'Rocket Balloon', 'Inferno Dragon', 'Super Dragon',
    'Phoenix', 'Super Minion', 'Drop Ship', 'Sky Wagon', 'Electro Owl'
  ])
  const SIEGE = new Set([
    'Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks', 'Log Launcher',
    'Flame Flinger', 'Battle Drill', 'Troop Launcher'
  ])
  const RANGED = new Set([
    'Archer', 'Wizard', 'Witch', 'Bowler', 'Headhunter', 'Sneaky Archer', 'Super Archer',
    'Super Wizard', 'Super Witch', 'Super Bowler', 'Night Witch', 'Spirit Fox',
    'Poison Lizard', 'Thrower', 'Unicorn', 'Diggy', 'Sneezy'
  ])

  function troopCategory(n) {
    if (AIR.has(n)) return 'air'
    if (SIEGE.has(n)) return 'siege'
    if (RANGED.has(n)) return 'ranged'
    return 'melee'
  }

  const GLYPHS = {
    hero: <path d="M4 16h12l-1-6-2.5 2L10 8l-2.5 4L5 10z" />,
    pet: <path d="M10 3a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4z" />,
    melee: <path d="M5 15L14 6M14 6l-1.5-.3L12 4l1.5.5.5 1.5zM5 15l-1 3 3-1M9 11l2 2" />,
    ranged: <path d="M5 4a9 9 0 0 1 0 12M5 4v12M5 10h11M16 10l-3-2m3 2l-3 2" />,
    air: <path d="M10 6c3 0 7 2 7 5-3 0-6-1-7-3-1 2-4 3-7 3 0-3 4-5 7-5zm0 3v7" />,
    siege: (
      <path d="M10 5l1.2 2.1 2.3-.7.5 2.4 2.4.4-.9 2.3 1.8 1.6-1.8 1.6.9 2.3-2.4.4-.5 2.4-2.3-.7L10 15l-1.2-2.1-2.3.7-.5-2.4-2.4-.4.9-2.3L2.7 9l1.8-1.6-.9-2.3 2.4-.4.5-2.4 2.3.7z" />
    ),
    spell: <path d="M10 4c2 3 4 5.5 4 8a4 4 0 0 1-8 0c0-2.5 2-5 4-8z" />,
    equipment: <path d="M10 3l5 3v4c0 4-2.5 6.5-5 7-2.5-.5-5-3-5-7V6z" />,
    townhall: (
      <path d="M3 17h14M4 17V10l6-5 6 5v7M8 17v-4h4v4M10 5v2" />
    )
  }

  const VILLAGE_COLOR = {
    home: '#D9A855',
    builderBase: '#8B6FD1'
  }

  let glyphKey = kind
  if (kind === 'troop') {
    glyphKey = troopCategory(name)
  } else if (kind === 'th') {
    glyphKey = 'townhall'
  }

  const glyph = GLYPHS[glyphKey] || GLYPHS.melee
  const color = VILLAGE_COLOR[village] || VILLAGE_COLOR.home

  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph}
    </svg>
  )
}

export default function ItemIcon({
  kind,
  name,
  level,
  village = 'home',
  className = 'w-5 h-5'
}) {
  const [hasError, setHasError] = useState(false)

  const isTownHall = kind === 'townhall' || kind === 'th'

  if (hasError || (!name && !level && !isTownHall)) {
    return <FallbackGlyph kind={kind} name={name} village={village} className={className} />
  }

  const imageUrl = getItemUrl(kind, name, level)

  return (
    <img
      src={imageUrl}
      alt={isTownHall ? `Town Hall ${level || name}` : name}
      className={`${className} object-contain shrink-0`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}