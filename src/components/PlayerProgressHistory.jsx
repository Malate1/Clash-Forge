import { useEffect, useMemo, useState } from 'react'
import { formatNumber } from '../utils/format.js'

const KEY_PREFIX = 'clash-forge:player-progress:v1:'

function readSnapshots(tag) {
  try {
    const value = JSON.parse(localStorage.getItem(`${KEY_PREFIX}${tag.replace(/^#/, '')}`) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function playerMetrics(player) {
  const items = [...(player.heroes || []), ...(player.troops || []), ...(player.spells || []), ...(player.heroEquipment || [])]
  const achievements = player.achievements || []
  return {
    trophies: Number(player.trophies || 0),
    townHall: Number(player.townHallLevel || 0),
    warStars: Number(player.warStars || 0),
    donations: Number(player.donations || 0),
    donationsReceived: Number(player.donationsReceived || 0),
    capitalGold: Number(player.clanCapitalContributions || 0),
    itemLevels: items.reduce((sum, item) => sum + Number(item.level || 0), 0),
    achievementProgress: achievements.reduce((sum, item) => sum + (Number(item.target) > 0 ? Math.min(1, Number(item.value || 0) / Number(item.target)) : 0), 0),
  }
}

function saveSnapshot(tag, metrics, existing) {
  const snapshot = { capturedAt: Date.now(), metrics }
  const next = [...existing, snapshot].slice(-40)
  try {
    localStorage.setItem(`${KEY_PREFIX}${tag.replace(/^#/, '')}`, JSON.stringify(next))
    return next
  } catch {
    return existing
  }
}

const METRICS = [
  ['trophies', 'Trophies'], ['townHall', 'Town Hall'], ['warStars', 'War stars'],
  ['donations', 'Donations'], ['donationsReceived', 'Donations received'], ['capitalGold', 'Capital gold'],
  ['itemLevels', 'Combined item levels'], ['achievementProgress', 'Achievement progress'],
]

export default function PlayerProgressHistory({ player }) {
  const tag = player.tag || ''
  const currentMetrics = useMemo(() => playerMetrics(player), [player])
  const [snapshots, setSnapshots] = useState(() => readSnapshots(tag))

  useEffect(() => {
    setSnapshots(readSnapshots(tag))
  }, [tag])

  useEffect(() => {
    if (!tag) return
    const history = readSnapshots(tag)
    const latest = history[history.length - 1]
    const changed = !latest || METRICS.some(([key]) => latest.metrics?.[key] !== currentMetrics[key])
    const oldEnough = !latest || Date.now() - latest.capturedAt >= 12 * 60 * 60 * 1000
    if (changed && oldEnough) setSnapshots(saveSnapshot(tag, currentMetrics, history))
  }, [tag, currentMetrics])

  const baseline = snapshots[0]?.metrics
  const captureNow = () => setSnapshots(saveSnapshot(tag, currentMetrics, readSnapshots(tag)))

  return <section className="rounded-2xl border border-slate-700/50 bg-[#182030] p-5 sm:p-6 shadow-md">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div><h2 className="font-clash text-2xl text-white uppercase tracking-wide">Progress history</h2>
        <p className="mt-1 text-xs text-slate-400">Check-ins are saved in this browser when this profile changes, at most every 12 hours.</p></div>
      <button type="button" onClick={captureNow} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#ffc800] hover:bg-slate-800">Save check-in</button>
    </div>
    {baseline ? <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {METRICS.map(([key, label]) => {
          const delta = currentMetrics[key] - Number(baseline[key] || 0)
          const formatted = key === 'achievementProgress' ? `${(currentMetrics[key] * 100).toFixed(0)}%` : formatNumber(currentMetrics[key])
          const difference = key === 'achievementProgress' ? `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(0)}%` : `${delta >= 0 ? '+' : ''}${formatNumber(delta)}`
          return <div key={key} className="rounded-xl border border-slate-700/40 bg-slate-900/30 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 font-clash text-lg text-slate-100">{formatted}</p>
            <p className={`text-xs font-semibold ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-500'}`}>{difference} since first check-in</p>
          </div>
        })}
      </div>
      <p className="text-xs text-slate-500">{snapshots.length} check-in{snapshots.length === 1 ? '' : 's'} · First saved {new Date(snapshots[0].capturedAt).toLocaleDateString()}</p>
    </> : <p className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">This is the first saved check-in. Return later or save another check-in to see progress over time.</p>}
  </section>
}
