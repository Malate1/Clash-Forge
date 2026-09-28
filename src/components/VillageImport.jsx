import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'clash-forge-village-export'

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

function extractUpgrades(data) {
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
  const objects = collectObjects(data)
  for (const obj of objects) {
    const value = firstValue(obj, ['builders', 'builderCount', 'builder_count', 'availableBuilders', 'available_builders'])
    if (Number.isFinite(Number(value))) return Number(value)
  }
  return null
}

export function useVillageExport() {
  const [raw, setRaw] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [error, setError] = useState(null)
  const [importedAt, setImportedAt] = useState(() => {
    const value = localStorage.getItem(`${STORAGE_KEY}:time`)
    return value ? Number(value) : null
  })

  const village = useMemo(() => {
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [raw])

  const upgrades = useMemo(() => village ? extractUpgrades(village) : [], [village])
  const builderCount = useMemo(() => village ? extractBuilderCount(village) : null, [village])

  function importVillage(value) {
    const cleaned = String(value || '').trim()
    if (!cleaned) {
      setError('Paste your village export first.')
      return false
    }

    try {
      JSON.parse(cleaned)
      localStorage.setItem(STORAGE_KEY, cleaned)
      const now = Date.now()
      localStorage.setItem(`${STORAGE_KEY}:time`, String(now))
      setRaw(cleaned)
      setImportedAt(now)
      setError(null)
      return true
    } catch {
      setError('That does not look like valid village JSON. Copy the complete export from Clash of Clans and paste it here.')
      return false
    }
  }

  function clearVillage() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}:time`)
    setRaw('')
    setImportedAt(null)
    setError(null)
  }

  return { raw, village, upgrades, builderCount, importedAt, error, importVillage, clearVillage }
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
  const { raw, upgrades, builderCount, importedAt, error, importVillage, clearVillage } = useVillageExport()
  const [open, setOpen] = useState(!raw)
  const [text, setText] = useState('')
  const [pasting, setPasting] = useState(false)
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
      importVillage(clipboard)
      setOpen(false)
    } catch {
      setOpen(true)
      setText('')
    } finally {
      setPasting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="plate p-5 sm:p-7 text-left overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#ffc800] shadow-[0_0_12px_rgba(255,200,0,.55)]" />
              <span className="font-clash text-xs uppercase tracking-[.16em] text-[#ffc800]">Village Export</span>
            </div>
            <h2 className="font-clash text-2xl sm:text-3xl text-white uppercase tracking-wide">Upload Village Export</h2>
            <p className="text-slate-400 text-sm mt-1">Import your snapshot to see active builders and upgrade progress.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={pasteVillage}
              disabled={pasting}
              className="rounded-xl bg-[#2a77f4] px-4 py-2.5 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pasting ? 'Reading Clipboard…' : 'Paste Village Data'}
            </button>
            {raw && (
              <button onClick={() => setOpen((value) => !value)} className="rounded-xl border border-slate-700/60 px-4 py-2.5 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-800/40">
                {open ? 'Hide' : 'Update Export'}
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
                <p className="text-xs text-slate-500">Your village export is stored locally in this browser.</p>
                <div className="flex gap-2">
                  {raw && <button onClick={clearVillage} className="px-3 py-2 text-xs font-bold text-red-400">Clear</button>}
                  <button onClick={() => { if (importVillage(text)) setOpen(false) }} className="rounded-lg bg-[#ffc800] px-4 py-2 text-xs font-black uppercase text-slate-950">
                    Import Village
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
            <span className="text-slate-300 text-sm font-semibold">Village export loaded</span>
            {importedAt && <span className="text-slate-500 text-xs">Updated {new Date(importedAt).toLocaleString()}</span>}
            <span className="ml-auto text-xs text-slate-400">{upgrades.length} active upgrade{upgrades.length === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>

      {raw && <BuilderUpgrades upgrades={upgrades} builderCount={builderCount} />}
    </section>
  )
}

function BuilderUpgrades({ upgrades, builderCount }) {
  const now = Date.now()

  return (
    <div className="plate p-5 sm:p-7 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <p className="font-clash text-xs uppercase tracking-[.16em] text-[#ffc800] mb-1">Village Overview</p>
          <h3 className="font-clash text-2xl sm:text-3xl text-white uppercase tracking-wide">Current Builder Upgrades</h3>
        </div>
        {builderCount !== null && <span className="text-xs font-bold text-slate-400">{builderCount} builder{builderCount === 1 ? '' : 's'} detected</span>}
      </div>

      {upgrades.length ? (
        <div className="grid md:grid-cols-2 gap-3">
          {upgrades.map((upgrade) => {
            const remaining = upgrade.endAt ? Math.max(0, upgrade.endAt - now) : null
            const total = upgrade.startedAt && upgrade.endAt ? upgrade.endAt - upgrade.startedAt : null
            const progress = total ? Math.min(100, Math.max(0, ((now - upgrade.startedAt) / total) * 100)) : null
            return (
              <div key={upgrade.id} className="rounded-2xl border border-slate-700/50 bg-slate-900/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-clash text-base sm:text-lg text-white uppercase tracking-wide truncate">{upgrade.name}</p>
                    {(upgrade.fromLevel || upgrade.toLevel || upgrade.level) && (
                      <p className="text-xs text-slate-400 mt-1">
                        {upgrade.fromLevel ? `Level ${upgrade.fromLevel} → ` : ''}
                        {upgrade.toLevel ? `Level ${upgrade.toLevel}` : upgrade.level ? `Level ${upgrade.level}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-400">
                    {remaining !== null ? formatRemaining(remaining) : 'In progress'}
                  </span>
                </div>

                <div className="mt-4 progress-track">
                  {progress !== null && <div className="progress-fill" style={{ width: `${progress}%` }} />}
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>{progress !== null ? `${Math.round(progress)}% complete` : 'Active upgrade'}</span>
                  {upgrade.endAt && <span>Finishes {new Date(upgrade.endAt).toLocaleString()}</span>}
                </div>
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
