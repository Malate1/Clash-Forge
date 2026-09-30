import { useMemo, useState } from 'react'
import ItemIcon from './ItemIcon.jsx'
import { isSuperTroop } from '../utils/troops.js'

const FILTERS = ['All', 'Heroes', 'Troops', 'Spells', 'Equipment']

export default function UpgradeGapPlanner({ player }) {
  const [filter, setFilter] = useState('All')
  const trackedItems = useMemo(() => {
    const categories = [
      ['Heroes', player.heroes || [], 'hero'],
      ['Troops', (player.troops || []).filter((troop) => !isSuperTroop(troop)), 'troop'],
      ['Spells', player.spells || [], 'spell'],
      ['Equipment', player.heroEquipment || [], 'equipment'],
    ]
    return categories.flatMap(([category, items, kind]) => items
      .filter((item) => Number(item.maxLevel) > 0)
      .map((item) => ({
        name: item.name,
        level: Number(item.level) || 0,
        maxLevel: Number(item.maxLevel),
        category,
        kind,
        village: item.village || 'home',
        remaining: Number(item.maxLevel) - (Number(item.level) || 0),
        progress: Math.min(100, Math.round(((Number(item.level) || 0) / Number(item.maxLevel)) * 100)),
      })))
  }, [player])

  const gaps = useMemo(() => trackedItems
    .filter((item) => item.remaining > 0)
    .sort((a, b) => a.progress - b.progress || b.remaining - a.remaining || a.name.localeCompare(b.name)), [trackedItems])
  const categories = [...new Set(gaps.map((item) => item.category))]
  const activeFilter = filter === 'All' || categories.includes(filter) ? filter : 'All'
  const filtered = activeFilter === 'All' ? gaps : gaps.filter((item) => item.category === activeFilter)
  const levelsToMax = gaps.reduce((sum, item) => sum + item.remaining, 0)
  const maxedCount = trackedItems.length - gaps.length
  const overallProgress = trackedItems.length
    ? Math.round(trackedItems.reduce((sum, item) => sum + item.progress, 0) / trackedItems.length)
    : 0
  if (!trackedItems.length) return null

  return <section className="rounded-2xl border border-slate-700/50 bg-[#182030] p-5 sm:p-6 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div><h2 className="font-clash text-2xl text-white uppercase tracking-wide">Upgrade gaps</h2>
          <p className="mt-1 text-xs text-slate-400">Items furthest from their API-reported max level appear first. Costs and upgrade times are not available here.</p></div>
      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">{levelsToMax} level{levelsToMax === 1 ? '' : 's'} to max</span>
    </div>
    <div className="mb-4 rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-200">Tracked level progress</span>
        <span className="text-slate-400">{maxedCount}/{trackedItems.length} items maxed · {overallProgress}% average</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label="Average tracked level progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallProgress}>
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width]" style={{ width: `${overallProgress}%` }} />
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter upgrade gaps">
      {FILTERS.filter((item) => item === 'All' || categories.includes(item)).map((item) => <button key={item} type="button" onClick={() => setFilter(item)}
        aria-pressed={activeFilter === item} className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${activeFilter === item ? 'border-[#ffc800]/50 bg-amber-500/10 text-[#ffc800]' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
        {item}
      </button>)}
    </div>
    {gaps.length && filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {filtered.slice(0, 18).map((item) => <div key={`${item.category}-${item.name}-${item.village}`} className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
        <div className="flex items-center gap-2.5">
          <ItemIcon kind={item.kind} name={item.name} village={item.village} className="h-9 w-9 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-slate-100">{item.name}</strong><span className="shrink-0 font-clash text-sm text-slate-300">{item.level}/{item.maxLevel}</span></div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.category} · {item.remaining} level{item.remaining === 1 ? '' : 's'} to max</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${item.progress}%` }} /></div>
      </div>)}
    </div> : gaps.length ? <p className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-4 text-sm text-slate-400">No upgrade gaps in this category.</p> : <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">All tracked heroes, troops, spells, and equipment are at their API-reported max levels.</p>}
    {filtered.length > 18 && <p className="mt-3 text-xs text-slate-500">Showing 18 of {filtered.length} items.</p>}
  </section>
}
