import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'clash-forge-village-export'
const VILLAGES_STORAGE_KEY = 'clash-forge-village-exports'

function firstValue(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key]
  }
  return null
}

function looksLikeDate(value) {
  if (typeof value !== 'string') return false
  return /^(\\d{4}[-/]\\d{2}[-/]\\d{2}|\\d{2}[-/]\\d{2}[-/]\\d{2}|\\d+:[0-5]\\d(:[0-5]\\d)?$)/.test(value.trim())
}

function toTimestamp(value) {
  if (typeof value === 'number') {
    if (value < 100000000000) return value * 1000
    return value
  }
  if (typeof value !== 'string') return null
  const n = Number(value)
  if (Number.isFinite(n) && value.trim() !== '') return n < 100000000000 ? n * 1000 : n
  const t = Date.parse(value)
  return Number.isNaN(t) ? null : t
}

function formatRemaining(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 'Complete'
  const totalMinutes = Math.ceil(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days) return `${days}d ${hours}h`
  if (hours) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatUpgradeCost(cost) {
  if (cost === null || cost === undefined || cost === '') return null
  const amount = Number(cost)
  return Number.isFinite(amount) ? new Intl.NumberFormat().format(amount) : null
}

function labelForObject(obj) {
  const value = firstValue(obj, [
    'name', 'displayName', 'buildingName', 'unitName', 'typeName',
    'building', 'itemName', 'upgradeName', 'id'
  ])
  if (typeof value !== 'string') return null
  return value
    .replace(/^TID_/i, '')
    .replace(/^BUILDING_/i, '')
    .replace(/^building_/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\\b\\w/g, (c) => c.toUpperCase())
    .trim()
}

function collectObjects(value, result = []) {
  if (!value || typeof value !== 'object') return result
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, result))
    return result
  }

  result.push(value)
  Object.values(value).forEach((child) => collectObjects(child, result))
  return result
}

const EXPORT_COLLECTIONS = [
  { key: 'buildings', label: 'Building' },
  { key: 'traps', label: 'Trap' },
  { key: 'heroes', label: 'Hero' },
  { key: 'units', label: 'Troop' },
  { key: 'spells', label: 'Spell' },
  { key: 'siege_machines', label: 'Siege Machine' },
  { key: 'pets', label: 'Pet' },
]

const DATA_NAMES = {
  1000000: 'Army Camp',
  1000001: 'Town Hall',
  1000002: 'Elixir Collector',
  1000003: 'Elixir Storage',
  1000004: 'Gold Mine',
  1000005: 'Gold Storage',
  1000006: 'Barracks',
  1000007: 'Laboratory',
  1000008: 'Cannon',
  1000009: 'Archer Tower',
  1000010: 'Wall',
  1000011: 'Wizard Tower',
  1000012: 'Air Defense',
  1000013: 'Mortar',
  1000014: 'Clan Castle',
  1000015: "Builder's Hut",
  1000019: 'Hidden Tesla',
  1000020: 'Spell Factory',
  1000021: 'X-Bow',
  1000023: 'Dark Elixir Drill',
  1000024: 'Dark Elixir Storage',
  1000026: 'Dark Barracks',
  1000027: 'Inferno Tower',
  1000028: 'Air Sweeper',
  1000029: 'Dark Spell Factory',
  1000031: 'Eagle Artillery',
  1000032: 'Bomb Tower',
  1000059: 'Workshop',
  1000067: 'Scattershot',
  1000068: 'Pet House',
  1000070: 'Blacksmith',
  1000071: 'Hero Hall',
  1000072: 'Spell Tower',
  1000077: 'Monolith',
  1000079: 'Multi-Gear Tower',
  1000084: 'Multi-Archer Tower',
  1000085: 'Ricochet Cannon',
  1000089: 'Firespitter',
  1000097: 'Crafted Defense',
  12000000: 'Bomb',
  12000001: 'Spring Trap',
  12000002: 'Giant Bomb',
  12000005: 'Air Bomb',
  12000006: 'Seeking Air Mine',
  12000008: 'Skeleton Trap',
  12000016: 'Tornado Trap',
  12000020: 'Giga Bomb',
  28000000: 'Barbarian King',
  28000001: 'Archer Queen',
  28000002: 'Grand Warden',
  28000004: 'Royal Champion',
  28000006: 'Minion Prince',
  28000007: 'Dragon Duke',
  4000000: 'Barbarian',
  4000001: 'Archer',
  4000002: 'Goblin',
  4000003: 'Giant',
  4000004: 'Wall Breaker',
  4000005: 'Balloon',
  4000006: 'Wizard',
  4000007: 'Healer',
  4000008: 'Dragon',
  4000009: 'P.E.K.K.A',
  4000010: 'Minion',
  4000011: 'Hog Rider',
  4000012: 'Valkyrie',
  4000013: 'Golem',
  4000015: 'Witch',
  4000017: 'Lava Hound',
  4000022: 'Bowler',
  4000023: 'Baby Dragon',
  4000024: 'Miner',
  4000051: 'Wall Wrecker',
  4000052: 'Battle Blimp',
  4000053: 'Yeti',
  4000058: 'Ice Golem',
  4000059: 'Electro Dragon',
  4000062: 'Stone Slammer',
  4000065: 'Dragon Rider',
  4000075: 'Siege Barracks',
  4000082: 'Headhunter',
  4000087: 'Log Launcher',
  4000091: 'Flame Flinger',
  4000092: 'Battle Drill',
  4000095: 'Electro Titan',
  4000097: 'Apprentice Warden',
  4000110: 'Root Rider',
  4000123: 'Druid',
  4000132: 'Thrower',
  4000135: 'Troop Launcher',
  4000150: 'Furnace',
  26000000: 'Lightning Spell',
  26000001: 'Healing Spell',
  26000002: 'Rage Spell',
  26000003: 'Jump Spell',
  26000005: 'Freeze Spell',
  26000009: 'Poison Spell',
  26000010: 'Earthquake Spell',
  26000011: 'Haste Spell',
  26000016: 'Clone Spell',
  26000017: 'Skeleton Spell',
  26000028: 'Bat Spell',
  26000035: 'Invisibility Spell',
  26000053: 'Recall Spell',
  26000070: 'Overgrowth Spell',
  26000098: 'Revive Spell',
  26000109: 'Ice Block Spell',
  73000000: 'L.A.S.S.I',
  73000001: 'Electro Owl',
  73000002: 'Mighty Yak',
  73000003: 'Unicorn',
  73000004: 'Phoenix',
  73000007: 'Poison Lizard',
  73000008: 'Diggy',
  73000009: 'Frosty',
  73000010: 'Spirit Fox',
  73000011: 'Angry Jelly',
  73000016: 'Sneezy',
  73000017: 'Greedy Raven',
}

function formatDataId(value) {
  if (value === null || value === undefined) return 'Unknown'
  return DATA_NAMES[value] || `Data #${value}`
}

const GAME_DATA_BASE = 'https://raw.githubusercontent.com/chiefpansancolt/clash-of-clans-data/main/data/home'
const UPGRADE_TIME_CACHE_KEY = 'clash-forge-upgrade-data-cache:v2'
const UPGRADE_TIME_CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const durationRequests = new Map()

const DATA_FOLDERS = {
  buildings: ['defenses', 'army-buildings', 'resource-buildings', 'town-hall', 'walls', 'crafted-defenses', 'other'],
  traps: ['traps'],
  heroes: ['heroes'],
  units: ['troops'],
  spells: ['spells'],
  siege_machines: ['siege-machines'],
  pets: ['pets'],
}

const BUILDING_FOLDER_BY_ID = {
  1000000: 'army-buildings', 1000001: 'town-hall', 1000002: 'resource-buildings',
  1000003: 'resource-buildings', 1000004: 'resource-buildings', 1000005: 'resource-buildings',
  1000006: 'army-buildings', 1000007: 'army-buildings', 1000014: 'army-buildings',
  1000020: 'army-buildings', 1000023: 'resource-buildings', 1000024: 'resource-buildings',
  1000026: 'army-buildings', 1000029: 'army-buildings', 1000059: 'army-buildings',
  1000068: 'army-buildings', 1000070: 'army-buildings', 1000071: 'army-buildings',
  1000015: 'defenses', 1000008: 'defenses', 1000009: 'defenses', 1000011: 'defenses',
  1000012: 'defenses', 1000013: 'defenses', 1000019: 'defenses', 1000021: 'defenses',
  1000027: 'defenses', 1000028: 'defenses', 1000031: 'defenses', 1000032: 'defenses',
  1000067: 'defenses', 1000072: 'defenses', 1000077: 'defenses', 1000079: 'defenses',
  1000084: 'defenses', 1000085: 'defenses', 1000089: 'defenses', 1000097: 'crafted-defenses',
  1000010: 'walls',
}

function upgradeTargetTimeMilliseconds(duration) {
  if (!duration || typeof duration !== 'object') return null
  const parts = ['days', 'hours', 'minutes', 'seconds']
  const hasTime = parts.some((part) => Number.isFinite(Number(duration[part])) && Number(duration[part]) > 0)
  if (!hasTime) return null
  return (
    (Number(duration.days) || 0) * 86400000 +
    (Number(duration.hours) || 0) * 3600000 +
    (Number(duration.minutes) || 0) * 60000 +
    (Number(duration.seconds) || 0) * 1000
  )
}

function readCachedUpgradeData(key) {
  try {
    const cache = JSON.parse(localStorage.getItem(UPGRADE_TIME_CACHE_KEY) || '{}')
    return cache[key] || null
  } catch {
    return null
  }
}

function saveCachedUpgradeData(key, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(UPGRADE_TIME_CACHE_KEY) || '{}')
    cache[key] = { data, savedAt: Date.now() }
    localStorage.setItem(UPGRADE_TIME_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // The fetched upgrade details remain usable for the current session if storage is full.
  }
}

function itemDataPathCandidates(upgrade) {
  const name = DATA_NAMES[upgrade.dataId]
  if (!name) return []
  const fileName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[.'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  let folders = DATA_FOLDERS[upgrade.dataCollection] || []
  if (upgrade.dataCollection === 'buildings' && BUILDING_FOLDER_BY_ID[upgrade.dataId]) {
    const preferred = BUILDING_FOLDER_BY_ID[upgrade.dataId]
    folders = [preferred, ...folders.filter((folder) => folder !== preferred)]
  }
  return folders.map((folder) => `${GAME_DATA_BASE}/${folder}/${fileName}.json`)
}

async function fetchOnlineUpgradeData(upgrade) {
  const candidates = itemDataPathCandidates(upgrade)
  const targetLevel = Number(upgrade.toLevel)
  if (!candidates.length || !Number.isFinite(targetLevel)) return null

  for (const url of candidates) {
    try {
      const response = await fetch(url)
      if (!response.ok) continue
      const item = await response.json()
      if (Number(item.dataId) !== Number(upgrade.dataId)) continue
      const target = item.levels?.find((level) => Number(level.level) === targetLevel)
      if (!target) continue
      return {
        durationMs: upgradeTargetTimeMilliseconds(target.buildTime || target.upgradeTime || target.researchTime),
        cost: target.buildCost ?? target.upgradeCost ?? target.researchCost ?? null,
        costResource: target.buildCostResource || target.upgradeCostResource || target.researchCostResource || null,
        maxLevel: Math.max(...item.levels.map((level) => Number(level.level)).filter(Number.isFinite)),
      }
    } catch {
      // Try the next valid category path when a file is absent or unavailable.
    }
  }
  return null
}

function getOnlineUpgradeData(upgrade) {
  const key = `${upgrade.dataId}:${upgrade.toLevel}`
  const cached = readCachedUpgradeData(key)
  if (cached && Date.now() - cached.savedAt < UPGRADE_TIME_CACHE_TTL) {
    return Promise.resolve(cached.data)
  }
  if (durationRequests.has(key)) return durationRequests.get(key)

  const request = fetchOnlineUpgradeData(upgrade)
    .then((data) => {
      if (data !== null) saveCachedUpgradeData(key, data)
      else if (cached) return cached.data
      return data
    })
    .finally(() => durationRequests.delete(key))
  durationRequests.set(key, request)
  return request
}

function extractRealExportUpgrades(data) {
  if (!data || typeof data !== 'object') return []

  const exportTimestamp = toTimestamp(data.timestamp)
  if (!exportTimestamp) return []

  const upgrades = []

  EXPORT_COLLECTIONS.forEach(({ key, label }) => {
    const entries = Array.isArray(data[key]) ? data[key] : []

    entries.forEach((entry, index) => {
      const timer = Number(entry && entry.timer)
      if (!Number.isFinite(timer) || timer <= 0) return

      const endAt = exportTimestamp + (timer * 1000)
      const level = firstValue(entry, ['lvl', 'level'])
      const dataId = firstValue(entry, ['data', 'id'])

      upgrades.push({
        id: `${key}-${dataId}-${index}-${timer}`,
        category: label,
        dataCollection: key,
        name: formatDataId(dataId),
        dataId,
        level,
        fromLevel: level,
        toLevel: Number.isFinite(Number(level)) ? Number(level) + 1 : null,
        timerSeconds: timer,
        endAt,
        startedAt: null,
        progress: null,
        supercharge: entry.supercharge === true,
      })
    })
  })

  return upgrades.sort((a, b) => a.endAt - b.endAt)
}

function extractUpgrades(data) {
  const realExportUpgrades = extractRealExportUpgrades(data)
  if (realExportUpgrades.length || Array.isArray(data?.buildings)) return realExportUpgrades

  // Fallback for older/custom test data.
  const objects = collectObjects(data)
  const upgrades = []
  const seen = new Set()

  objects.forEach((obj) => {
    const keys = Object.keys(obj).map((key) => key.toLowerCase())
    const hasUpgradeWord = keys.some((key) => /(upgrade|construct|building|worker|builder)/.test(key))
    const endValue = firstValue(obj, [
      'upgradeEndTime', 'upgrade_end_time', 'constructionEndTime',
      'construction_end_time', 'finishTime', 'finish_time',
      'endTime', 'end_time', 'completionTime', 'completion_time'
    ])

    if (!hasUpgradeWord || endValue === null) return

    const label = labelForObject(obj) || 'Current upgrade'
    const timestamp = toTimestamp(endValue)
    const startedValue = firstValue(obj, [
      'upgradeStartTime', 'upgrade_start_time', 'constructionStartTime',
      'construction_start_time', 'startTime', 'start_time'
    ])
    const startedAt = toTimestamp(startedValue)
    const key = `${label}|${String(endValue)}`
    if (seen.has(key)) return
    seen.add(key)

    upgrades.push({
      id: key,
      category: 'Upgrade',
      name: label,
      level: firstValue(obj, ['level', 'currentLevel', 'current_level', 'toLevel', 'to_level']),
      fromLevel: firstValue(obj, ['fromLevel', 'from_level', 'levelFrom', 'level_from']),
      toLevel: firstValue(obj, ['toLevel', 'to_level', 'targetLevel', 'target_level']),
      endAt: timestamp,
      startedAt,
      rawEnd: endValue,
      progress: startedAt && timestamp && timestamp > startedAt
        ? Math.min(100, Math.max(0, ((Date.now() - startedAt) / (timestamp - startedAt)) * 100))
        : null
    })
  })

  return upgrades
    .filter((item) => !item.endAt || item.endAt > Date.now())
    .sort((a, b) => (a.endAt || Infinity) - (b.endAt || Infinity))
}

function extractBuilderCount(data) {
  const directValue = firstValue(data, ['builders', 'builderCount', 'builder_count'])
  if (directValue !== null && Number.isFinite(Number(directValue))) return Number(directValue)
  return null
}

function extractVillageStats(data) {
  if (!data || typeof data !== 'object') return null
  const buildings = Array.isArray(data.buildings) ? data.buildings : []
  const heroes = Array.isArray(data.heroes) ? data.heroes : []
  const units = Array.isArray(data.units) ? data.units : []
  const spells = Array.isArray(data.spells) ? data.spells : []
  const traps = Array.isArray(data.traps) ? data.traps : []
  const pets = Array.isArray(data.pets) ? data.pets : []
  const siege = Array.isArray(data.siege_machines) ? data.siege_machines : []

  const townHall = buildings.find((entry) => Number(firstValue(entry, ['data', 'id'])) === 1000001)
  const active = [...buildings, ...heroes, ...units, ...spells, ...traps, ...pets, ...siege]
    .filter((entry) => Number(entry && entry.timer) > 0).length

  return {
    townHall: firstValue(townHall, ['lvl', 'level']),
    buildings: buildings.length,
    heroes: heroes.length,
    troops: units.length,
    spells: spells.length,
    traps: traps.length,
    pets: pets.length,
    siege: siege.length,
    active,
  }
}

export function useVillageExport() {
  const [saved, setSaved] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(VILLAGES_STORAGE_KEY) || 'null')
      if (Array.isArray(stored)) {
        return { villages: stored, selectedId: stored[0]?.id || '' }
      }

      const legacy = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
        const id = `tag:${String(legacy.tag || 'village').replace(/^#/, '').toUpperCase()}`
        const importedAt = Number(localStorage.getItem(`${STORAGE_KEY}:time`)) || Date.now()
        return { villages: [{ id, data: legacy, importedAt }], selectedId: id }
      }
    } catch {
      // Ignore invalid stored data and let the user import a fresh export.
    }
    return { villages: [], selectedId: '' }
  })
  const [error, setError] = useState(null)
  const selected = saved.villages.find((entry) => entry.id === saved.selectedId) || saved.villages[0] || null
  const village = selected?.data || null
  const importedAt = selected?.importedAt || null
  const raw = selected ? JSON.stringify(selected.data) : ''

  const upgrades = useMemo(() => village ? extractUpgrades(village) : [], [village])
  const builderCount = useMemo(() => village ? extractBuilderCount(village) : null, [village])

  function importVillage(value) {
    const cleaned = String(value || '').trim()
    if (!cleaned) {
      setError('Paste your village export first.')
      return false
    }

    try {
      const data = JSON.parse(cleaned)
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        setError('Import one village JSON object at a time.')
        return false
      }
      const now = Date.now()
      const tag = typeof data.tag === 'string' ? data.tag.trim().replace(/^#/, '').toUpperCase() : ''
      const id = tag
        ? `tag:${tag}`
        : `village:${now}:${Math.random().toString(36).slice(2, 8)}`
      const record = { id, data, importedAt: now }
      const existingIndex = saved.villages.findIndex((entry) => entry.id === id)
      const villages = existingIndex < 0
        ? [...saved.villages, record]
        : saved.villages.map((entry, index) => index === existingIndex ? record : entry)

      try {
        localStorage.setItem(VILLAGES_STORAGE_KEY, JSON.stringify(villages))
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(`${STORAGE_KEY}:time`)
      } catch {
        setError('Could not save this village in browser storage. Free some browser storage and try again.')
        return false
      }

      setSaved({ villages, selectedId: id })
      setError(null)
      return true
    } catch {
      setError('That does not look like valid village JSON. Import one complete village export at a time.')
      return false
    }
  }

  function selectVillage(id) {
    setSaved((current) => ({ ...current, selectedId: id }))
  }

  function clearVillage(id) {
    const villages = saved.villages.filter((entry) => entry.id !== id)
    const selectedId = saved.selectedId === id ? villages[0]?.id || '' : saved.selectedId
    try {
      if (villages.length) localStorage.setItem(VILLAGES_STORAGE_KEY, JSON.stringify(villages))
      else localStorage.removeItem(VILLAGES_STORAGE_KEY)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(`${STORAGE_KEY}:time`)
    } catch {
      setError('Could not clear this village from browser storage. Please try again.')
      return false
    }
    setSaved({ villages, selectedId })
    setError(null)
    return true
  }

  return {
    raw,
    village,
    villages: saved.villages,
    selectedVillageId: selected?.id || '',
    upgrades,
    builderCount,
    importedAt,
    error,
    importVillage,
    selectVillage,
    clearVillage,
  }
}

function ImportSteps() {
  return (
    <div className="grid sm:grid-cols-3 gap-3 text-left">
      {[
        ['01', 'Open Settings', 'Open your village Settings, then press More Settings.'],
        ['02', 'Export Data', 'Scroll to the bottom and press Data Export → Copy.'],
        ['03', 'Paste Here', 'Press Paste Village Data and allow clipboard access.'],
      ].map(([number, title, text]) => (
        <div key={number} className="rounded-2xl border border-slate-700/50 bg-slate-900/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-clash text-[#ffc800] text-sm">{number}</span>
            <span className="font-clash text-white uppercase tracking-wide text-sm">{title}</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )
}

export default function VillageImport() {
  const {
    raw,
    village,
    villages,
    selectedVillageId,
    upgrades,
    builderCount,
    importedAt,
    error,
    importVillage,
    selectVillage,
    clearVillage,
  } = useVillageExport()
  const [open, setOpen] = useState(!raw)
  const [text, setText] = useState('')
  const [pasting, setPasting] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => tick((value) => value + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  async function pasteVillage() {
    setPasting(true)
    try {
      const clipboard = await navigator.clipboard.readText()
      setText(clipboard)
      if (importVillage(clipboard)) setOpen(false)
    } catch {
      setOpen(true)
      setText('')
    } finally {
      setPasting(false)
    }
  }

  function clearSelectedVillage() {
    if (!selectedVillageId) return
    const selected = villages.find((entry) => entry.id === selectedVillageId)
    const label = selected ? villageLabel(selected, villages.indexOf(selected)) : 'this village'
    if (!window.confirm(`Clear the uploaded JSON data for ${label}? Other saved villages will remain.`)) return
    if (clearVillage(selectedVillageId)) {
      setText('')
      setOpen(villages.length === 1)
      setComparing(false)
    }
  }

  const stats = village ? extractVillageStats(village) : null

  return (
    <section className="space-y-5">
      <div className="plate p-5 sm:p-7 text-left overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#ffc800] shadow-[0_0_12px_rgba(255,200,0,.55)]" />
              <span className="font-clash text-xs uppercase tracking-[.16em] text-[#ffc800]">Village Export</span>
            </div>
            <h2 className="font-clash text-2xl sm:text-3xl text-white uppercase tracking-wide">
              {villages.length ? 'Village Exports' : 'Upload Village Export'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Add one JSON export per village, then compare their progress.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={pasteVillage}
              disabled={pasting}
              className="rounded-xl bg-[#2a77f4] px-4 py-2.5 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pasting ? 'Reading Clipboard…' : 'Paste Village Data'}
            </button>
            {villages.length > 0 && (
              <button onClick={() => { setOpen((value) => !value); setError(null) }} className="rounded-xl border border-slate-700/60 px-4 py-2.5 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-800/40">
                {open ? 'Close Import' : '+ Add Another Village'}
              </button>
            )}
          </div>
        </div>

        {open && (
          <div className="space-y-5">
            <ImportSteps />

            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/20 p-4">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste the complete village JSON here…"
                rows={6}
                className="w-full resize-y rounded-xl border border-slate-700/60 bg-slate-950/40 p-3 text-xs font-mono text-slate-200 outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                <p className="text-xs text-slate-500">Each import adds a village or updates the same village tag. Data stays in this browser.</p>
                <div className="flex gap-2">
                  <button onClick={() => { if (importVillage(text)) { setOpen(false); setText('') } }} className="rounded-lg bg-[#ffc800] px-4 py-2 text-xs font-black uppercase text-slate-950">
                    {villages.length ? 'Add / Update Village' : 'Import Village'}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          </div>
        )}

        {raw && !open && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900/20 border border-slate-700/40 px-4 py-3">
            <span className="text-emerald-400 text-sm">✓</span>
            <span className="text-slate-300 text-sm font-semibold">{villages.length} village{villages.length === 1 ? '' : 's'} saved</span>
            {importedAt && <span className="text-slate-500 text-xs">Updated {new Date(importedAt).toLocaleString()}</span>}
            <span className="ml-auto text-xs text-slate-400">{upgrades.length} active upgrade{upgrades.length === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>

      {villages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select village">
              {villages.map((entry, index) => {
                const label = villageLabel(entry, index)
                const selected = entry.id === selectedVillageId
                return <button key={entry.id} type="button" onClick={() => { selectVillage(entry.id); setComparing(false) }}
                  aria-pressed={selected}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold ${selected ? 'border-[#ffc800]/50 bg-amber-500/10 text-[#ffc800]' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                  {label}
                </button>
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={clearSelectedVillage}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-300 hover:bg-red-500/10">
                Clear Selected Data
              </button>
              {villages.length > 1 && (
                <button type="button" onClick={() => setComparing((value) => !value)} aria-pressed={comparing}
                  className={`rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-wide ${comparing ? 'border-[#ffc800]/50 bg-amber-500/10 text-[#ffc800]' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                  {comparing ? 'View Selected Village' : 'Compare Villages'}
                </button>
              )}
            </div>
          </div>

          {comparing
            ? <VillageComparison villages={villages} />
            : <VillageDashboard key={selectedVillageId} village={village} stats={stats} upgrades={upgrades} builderCount={builderCount} />}
        </div>
      )}
    </section>
  )
}

function villageLabel(record, index) {
  const tag = record.data?.tag
  const townHall = extractVillageStats(record.data)?.townHall
  return `${tag ? `#${String(tag).replace(/^#/, '')}` : `Village ${index + 1}`}${townHall ? ` · TH${townHall}` : ''}`
}

function comparisonItems(village) {
  const items = new Map()

  EXPORT_COLLECTIONS.forEach(({ key, label }) => {
    const duplicates = new Map()
    const entries = Array.isArray(village?.[key]) ? village[key] : []
    entries.forEach((entry) => {
      const dataId = firstValue(entry, ['data', 'id'])
      const occurrence = duplicates.get(dataId) || 0
      duplicates.set(dataId, occurrence + 1)
      const id = `${key}:${dataId}:${occurrence}`
      const kind = key === 'buildings' ? 'building'
        : key === 'traps' ? 'trap'
          : key === 'heroes' ? 'hero'
            : key === 'pets' ? 'pet'
              : key === 'spells' ? 'spell' : 'troop'
      items.set(id, {
        id,
        name: formatDataId(dataId),
        category: label,
        kind,
        level: firstValue(entry, ['lvl', 'level']),
      })
    })
  })

  return items
}

function VillageComparison({ villages }) {
  const [leftId, setLeftId] = useState(villages[0]?.id || '')
  const [rightId, setRightId] = useState(villages[1]?.id || '')
  const left = villages.find((entry) => entry.id === leftId) || villages[0]
  const right = villages.find((entry) => entry.id === rightId) || villages[1] || villages[0]
  const leftItems = comparisonItems(left.data)
  const rightItems = comparisonItems(right.data)
  const itemIds = new Set([...leftItems.keys(), ...rightItems.keys()])
  const rows = [...itemIds].map((id) => ({ id, left: leftItems.get(id), right: rightItems.get(id) }))
    .sort((a, b) => {
      const categoryOrder = (a.left || a.right).category.localeCompare((b.left || b.right).category)
      return categoryOrder || (a.left || a.right).name.localeCompare((b.left || b.right).name)
    })
  const leftStats = extractVillageStats(left.data)
  const rightStats = extractVillageStats(right.data)
  const leftName = villageLabel(left, villages.findIndex((entry) => entry.id === left.id))
  const rightName = villageLabel(right, villages.findIndex((entry) => entry.id === right.id))

  return (
    <section className="village-tracker plate p-4 sm:p-6 text-left space-y-5">
      <div>
        <p className="font-clash text-xs uppercase tracking-[.16em] text-[#ffc800]">Village comparison</p>
        <h3 className="font-clash text-2xl sm:text-3xl text-white uppercase tracking-wide">Compare progress</h3>
        <p className="mt-1 text-sm text-slate-400">Compare exported levels item by item. The difference is first village level minus second village level.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <ComparisonVillageCard stats={leftStats} selectedId={leftId} excludeId={rightId} onSelect={setLeftId} villages={villages} label="First village" />
        <ComparisonVillageCard stats={rightStats} selectedId={rightId} excludeId={leftId} onSelect={setRightId} villages={villages} label="Second village" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr><th className="px-3 py-3">Item</th><th className="px-3 py-3">{leftName}</th><th className="px-3 py-3">{rightName}</th><th className="px-3 py-3">Difference</th></tr>
          </thead>
          <tbody>
            {rows.map(({ id, left: leftItem, right: rightItem }) => {
              const item = leftItem || rightItem
              const leftLevel = leftItem?.level == null ? null : Number(leftItem.level)
              const rightLevel = rightItem?.level == null ? null : Number(rightItem.level)
              const delta = leftLevel !== null && rightLevel !== null && Number.isFinite(leftLevel) && Number.isFinite(rightLevel)
                ? leftLevel - rightLevel
                : null
              const difference = delta === null
                ? leftItem ? 'Not in second export' : 'Not in first export'
                : delta === 0 ? 'Same level' : `${delta > 0 ? leftName : rightName} +${Math.abs(delta)}`
              return <tr key={id} className="border-t border-slate-700/30 text-slate-300">
                <td className="px-3 py-2.5"><span className="inline-flex items-center gap-2"><span className="h-7 w-7 shrink-0"><VillageItemIcon kind={item.kind} name={item.name} level={leftItem?.level || rightItem?.level} /></span><span><span className="block text-xs font-semibold text-slate-100">{item.name}</span><span className="text-[10px] text-slate-500">{item.category}</span></span></span></td>
                <td className="px-3 py-2.5 font-clash">{leftLevel ?? '—'}</td>
                <td className="px-3 py-2.5 font-clash">{rightLevel ?? '—'}</td>
                <td className={`px-3 py-2.5 text-xs font-semibold ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-amber-300' : 'text-slate-400'}`}>{difference}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="text-sm text-slate-400">These exports do not contain comparable item levels.</p>}
    </section>
  )
}

function ComparisonVillageCard({ stats, selectedId, excludeId, onSelect, villages, label }) {
  return (
    <div className="village-side-card space-y-3">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}
        <select value={selectedId} onChange={(event) => onSelect(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0f141e] px-3 py-2 text-sm font-semibold text-slate-100">
          {villages.map((entry, index) => <option key={entry.id} value={entry.id} disabled={entry.id === excludeId}>{villageLabel(entry, index)}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <InfoRow label="Town Hall" value={`Level ${stats?.townHall || '—'}`} />
        <InfoRow label="Buildings" value={stats?.buildings || 0} />
        <InfoRow label="Heroes" value={stats?.heroes || 0} />
        <InfoRow label="Troops" value={stats?.troops || 0} />
        <InfoRow label="Active upgrades" value={stats?.active || 0} />
      </div>
    </div>
  )
}

function VillageDashboard({ village, stats, upgrades, builderCount }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const now = Date.now()
  const tag = village?.tag || 'Unknown village'
  const exportedAt = toTimestamp(village?.timestamp)
  const entriesFor = (key) => (Array.isArray(village?.[key]) ? village[key] : []).map((entry, index) => ({
    ...entry,
    name: formatDataId(firstValue(entry, ['data', 'id'])),
    id: `${key}-${firstValue(entry, ['data', 'id'])}-${index}`,
  }))
  const buildings = entriesFor('buildings')
  const army = [
    ...entriesFor('heroes').map((item) => ({ ...item, category: 'Hero', kind: 'hero' })),
    ...entriesFor('units').map((item) => ({ ...item, category: 'Troop', kind: 'troop' })),
    ...entriesFor('spells').map((item) => ({ ...item, category: 'Spell', kind: 'spell' })),
    ...entriesFor('pets').map((item) => ({ ...item, category: 'Pet', kind: 'pet' })),
    ...entriesFor('siege_machines').map((item) => ({ ...item, category: 'Siege Machine', kind: 'troop' })),
  ]
  const traps = entriesFor('traps').map((item) => ({ ...item, category: 'Trap', kind: 'trap' }))
  const categories = [
    ['Buildings', stats?.buildings || 0, 'building', buildings[0]],
    ['Heroes', stats?.heroes || 0, 'hero', army.find((item) => item.kind === 'hero')],
    ['Troops', stats?.troops || 0, 'troop', army.find((item) => item.kind === 'troop')],
    ['Spells', stats?.spells || 0, 'spell', army.find((item) => item.kind === 'spell')],
    ['Traps', stats?.traps || 0, 'trap', traps[0]],
    ['Pets', stats?.pets || 0, 'pet', army.find((item) => item.kind === 'pet')],
  ]
  const tabs = ['Overview', 'Upgrades', 'Buildings', 'Army']

  return (
    <div className="village-tracker plate p-4 sm:p-6 text-left">
      <div className="village-tracker-head">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="village-th-badge">
              <VillageItemIcon kind="building" name="Town Hall" level={stats?.townHall} fallback={stats?.townHall || '—'} />
            </div>
            <div className="min-w-0">
              <p className="font-clash text-xs uppercase tracking-[.16em] text-[#ffc800]">Village Tracker</p>
              <h3 className="font-clash text-2xl sm:text-3xl text-white uppercase tracking-wide truncate">Town Hall {stats?.townHall || '—'} Village</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{tag}</p>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Exported</p>
          <p className="text-sm font-semibold text-slate-300">{exportedAt ? new Date(exportedAt).toLocaleString() : '—'}</p>
          <p className="text-xs text-slate-500 mt-1">{stats?.active || 0} active upgrades</p>
        </div>
      </div>

      <div className="village-tabs" role="tablist" aria-label="Village sections">
        {tabs.map((tab) => (
          <button key={tab} id={`village-tab-${tab.toLowerCase()}`} type="button" role="tab"
            aria-selected={activeTab === tab} aria-controls="village-tab-panel"
            className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="village-stat-grid">
        {categories.map(([label, count, kind, item]) => (
          <div className="village-stat" key={label}>
            <span className="village-stat-icon"><VillageItemIcon kind={kind} name={item?.name} level={item?.lvl} /></span>
            <div><strong>{count}</strong><small>{label}</small></div>
          </div>
        ))}
      </div>

      <div id="village-tab-panel" role="tabpanel" aria-labelledby={`village-tab-${activeTab.toLowerCase()}`} className="mt-6">
        {activeTab === 'Overview' && <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-5">
          <BuilderUpgrades upgrades={upgrades} builderCount={builderCount} />
          <div className="village-side-card">
            <div className="flex items-center justify-between mb-4"><h4 className="font-clash text-lg text-white uppercase tracking-wide">Village data</h4><span className="text-xs text-slate-500">Export</span></div>
            <div className="space-y-3">
              <InfoRow label="Town Hall" value={`Level ${stats?.townHall || '—'}`} />
              <InfoRow label="Buildings" value={stats?.buildings || 0} />
              <InfoRow label="Traps" value={stats?.traps || 0} />
              <InfoRow label="Pets" value={stats?.pets || 0} />
              <InfoRow label="Siege machines" value={stats?.siege || 0} />
            </div>
          </div>
        </div>}
        {activeTab === 'Upgrades' && <BuilderUpgrades upgrades={upgrades} builderCount={builderCount} />}
        {activeTab === 'Buildings' && <VillageItemGrid title="Buildings & Traps" items={[
          ...buildings.map((item) => ({ ...item, category: 'Building', kind: 'building' })), ...traps,
        ]} empty="No buildings or traps found in this export." />}
        {activeTab === 'Army' && <VillageItemGrid title="Army" items={army} empty="No heroes, troops, spells, pets, or siege machines found in this export." />}
      </div>
    </div>
  )
}

const VILLAGE_ASSET_BASE = 'https://assets.clashk.ing'

function villageAssetUrl(kind, name, level) {
  const clean = String(name || '').toLowerCase().replace(/[.'’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  if (!clean) return null
  if (kind === 'building') return `${VILLAGE_ASSET_BASE}/buildings/home-village/${clean}/level_${Math.max(1, Number(level) || 1)}.webp`
  if (kind === 'trap') return `${VILLAGE_ASSET_BASE}/traps/home-village/${clean}/level_${Math.max(1, Number(level) || 1)}.webp`
  if (kind === 'hero' || kind === 'pet' || kind === 'troop') return `${VILLAGE_ASSET_BASE}/${kind === 'hero' ? 'heroes' : kind === 'pet' ? 'pets' : 'troops'}/${clean}/icon.webp`
  if (kind === 'spell') return `${VILLAGE_ASSET_BASE}/spells/${clean}.webp`
  return null
}

function VillageItemIcon({ kind, name, level, fallback }) {
  const [failed, setFailed] = useState(false)
  const src = villageAssetUrl(kind, name, level)
  return src && !failed
    ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    : <span aria-hidden="true">{fallback ?? (kind === 'hero' ? '⚔' : kind === 'trap' ? '✹' : kind === 'spell' ? '✦' : '◆')}</span>
}

function VillageItemGrid({ title, items, empty }) {
  return <div className="village-upgrades-card">
    <h4 className="font-clash text-xl text-white uppercase tracking-wide mb-4">{title}</h4>
    {items.length ? <div className="village-item-grid">{items.map((item) => (
      <div className="village-item-card" key={item.id}>
        <span className="village-item-icon"><VillageItemIcon kind={item.kind} name={item.name} level={item.lvl} /></span>
        <div className="min-w-0"><strong>{item.name}</strong><small>{item.category} · Level {item.lvl ?? '—'}</small></div>
      </div>
    ))}</div> : <p className="text-sm text-slate-400">{empty}</p>}
  </div>
}

function InfoRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-700/30 pb-2 last:border-0 last:pb-0"><span className="text-sm text-slate-400">{label}</span><strong className="text-sm text-white">{value}</strong></div>
}

function BuilderUpgrades({ upgrades, builderCount }) {
  const now = Date.now()
  const [onlineUpgradeData, setOnlineUpgradeData] = useState({})

  useEffect(() => {
    let cancelled = false
    setOnlineUpgradeData({})
    Promise.all(upgrades.map(async (upgrade) => [upgrade.id, await getOnlineUpgradeData(upgrade)]))
      .then((entries) => {
        if (!cancelled) setOnlineUpgradeData(Object.fromEntries(entries))
      })
    return () => { cancelled = true }
  }, [upgrades])

  const waitingForOnlineData = upgrades.some((upgrade) => !Object.hasOwn(onlineUpgradeData, upgrade.id))

  return (
    <div className="village-upgrades-card">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <p className="font-clash text-xs uppercase tracking-[.16em] text-[#ffc800] mb-1">Village Overview</p>
          <h3 className="font-clash text-2xl sm:text-3xl text-white uppercase tracking-wide">Current Builder Upgrades</h3>
          <p className="mt-1 text-xs text-slate-400">
            Estimates use the <a href="https://github.com/chiefpansancolt/clash-of-clans-data" target="_blank" rel="noreferrer" className="text-slate-300 underline decoration-slate-600 underline-offset-2">online upgrade-time dataset</a>.
            Boosts and event discounts can affect accuracy.
          </p>
        </div>
        <div className="text-right text-xs font-bold text-slate-400">
          <p>{builderCount === null ? 'Builder count not included in export' : `${builderCount} builder${builderCount === 1 ? '' : 's'} detected`}</p>
          {waitingForOnlineData && <p className="mt-1 text-slate-500">Loading upgrade details…</p>}
        </div>
      </div>

      {upgrades.length ? (
        <div className="space-y-2">
          {upgrades.map((upgrade) => {
            const remaining = upgrade.endAt ? Math.max(0, upgrade.endAt - now) : null
            const total = upgrade.startedAt && upgrade.endAt ? upgrade.endAt - upgrade.startedAt : null
            const upgradeData = onlineUpgradeData[upgrade.id]
            const expectedDuration = upgradeData?.durationMs
            const formattedCost = formatUpgradeCost(upgradeData?.cost)
            const isEstimated = !total && Number.isFinite(expectedDuration) && expectedDuration > 0 && remaining !== null
            const progress = total
              ? Math.min(100, Math.max(0, ((now - upgrade.startedAt) / total) * 100))
              : isEstimated
                ? Math.min(100, Math.max(0, ((expectedDuration - remaining) / expectedDuration) * 100))
                : null
            return (
              <div key={upgrade.id} className="village-upgrade-row">
                <div className="village-upgrade-icon"><VillageItemIcon
                  kind={upgrade.category === 'Hero' ? 'hero' : upgrade.category === 'Trap' ? 'trap' : upgrade.category === 'Troop' || upgrade.category === 'Siege Machine' ? 'troop' : upgrade.category === 'Spell' ? 'spell' : upgrade.category === 'Pet' ? 'pet' : 'building'}
                  name={upgrade.name} level={upgrade.level}
                /></div>
                <div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-clash text-base sm:text-lg text-white uppercase tracking-wide truncate">{upgrade.name}</p>
                    {(upgrade.fromLevel || upgrade.toLevel || upgrade.level) && (
                      <p className="text-xs text-slate-400 mt-1">
                        {upgrade.fromLevel ? `Level ${upgrade.fromLevel} → ` : ''}
                        {upgrade.toLevel ? `Level ${upgrade.toLevel}` : upgrade.level ? `Level ${upgrade.level}` : ''}
                        {upgradeData?.maxLevel > 0 && <span> · Max {upgradeData.maxLevel}</span>}
                      </p>
                    )}
                    {(expectedDuration > 0 || formattedCost !== null) && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {expectedDuration > 0 && <span>Base time {formatRemaining(expectedDuration)}</span>}
                        {expectedDuration > 0 && formattedCost !== null && <span> · </span>}
                        {formattedCost !== null && <span>Cost {formattedCost}{upgradeData.costResource ? ` ${upgradeData.costResource}` : ''}</span>}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-400">
                    {remaining !== null ? formatRemaining(remaining) : 'In progress'}
                  </span>
                </div>

                {progress !== null
                  ? <div className="mt-3 progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  : <p className="mt-3 text-[10px] text-slate-500">Progress percentage unavailable for this export</p>}
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>{progress !== null ? `${isEstimated ? '~' : ''}${Math.round(progress)}% ${isEstimated ? 'estimated' : 'complete'}` : remaining !== null ? 'Progress unavailable' : 'Active upgrade'}</span>
                  {upgrade.endAt && <span>Finishes {new Date(upgrade.endAt).toLocaleString()}</span>}
                </div></div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700/60 p-7 text-center">
          <p className="font-clash text-lg text-white uppercase tracking-wide">No active builder upgrades detected</p>
          <p className="text-slate-400 text-sm mt-1">Import a fresh village export after starting an upgrade.</p>
        </div>
      )}
    </div>
  )
}
