import { useEffect, useState } from 'react'
import { getCapitalRaidSeasons, CocApiError } from '../api/coc.js'
import { formatNumber, formatDateTime } from '../utils/format.js'

export default function CapitalRaidHistory({ clanTag }) {
  const [seasons, setSeasons] = useState([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getCapitalRaidSeasons(clanTag)
      .then((response) => {
        if (!cancelled) {
          setSeasons(response.items || [])
          setSelected(0)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof CocApiError ? err.message : 'Could not load Capital Raid history.')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [clanTag])

  if (loading) return <p className="rounded-xl border border-slate-700/40 bg-slate-900/20 px-4 py-3 text-xs text-slate-400">Loading Capital Raid history…</p>
  if (error) return <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-slate-400">Capital Raid history is unavailable: {error}</p>
  if (!seasons.length) return null

  const season = seasons[selected]
  const members = [...(season.members || [])].sort((a, b) => (b.capitalResourcesLooted || 0) - (a.capitalResourcesLooted || 0))
  const title = season.startTime ? formatDateTime(season.startTime) : `Raid weekend ${selected + 1}`

  return (
    <section className="rounded-2xl border border-slate-700/50 bg-[#182030] p-5 sm:p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-clash text-2xl text-[#ffc800] uppercase tracking-wide">Capital Raid History</h2>
          <p className="mt-1 text-sm text-slate-400">Recent raid weekends reported by the Clash of Clans API.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          Weekend
          <select value={selected} onChange={(event) => setSelected(Number(event.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-200">
            {seasons.map((item, index) => (
              <option key={`${item.startTime || index}`} value={index}>{item.startTime ? formatDateTime(item.startTime) : `Weekend ${index + 1}`}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <RaidStat label="Weekend" value={title} />
        <RaidStat label="Capital loot" value={formatNumber(season.capitalTotalLoot)} />
        <RaidStat label="Attacks" value={formatNumber(season.totalAttacks)} />
        <RaidStat label="Districts cleared" value={formatNumber(season.enemyDistrictsDestroyed)} />
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-400">
        <span>Raids completed: <strong className="text-slate-200">{formatNumber(season.raidsCompleted)}</strong></span>
        <span>Offensive reward: <strong className="text-slate-200">{formatNumber(season.offensiveReward)}</strong></span>
        <span>Defensive reward: <strong className="text-slate-200">{formatNumber(season.defensiveReward)}</strong></span>
      </div>

      {members.length > 0 && <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full min-w-[520px] text-sm">
          <thead><tr className="bg-slate-900/60 text-left text-[11px] uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3">#</th><th className="px-4 py-3">Member</th><th className="px-4 py-3 text-right">Attacks</th><th className="px-4 py-3 text-right">Capital gold looted</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-700/40">
            {members.map((member, index) => <tr key={member.tag || member.name}>
              <td className="px-4 py-3 text-slate-500">{index + 1}</td>
              <td className="px-4 py-3 font-semibold text-slate-200">{member.name || member.tag}</td>
              <td className="px-4 py-3 text-right text-slate-300">{formatNumber(member.attacks)}</td>
              <td className="px-4 py-3 text-right font-clash text-[#ffc800]">{formatNumber(member.capitalResourcesLooted)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>}
    </section>
  )
}

function RaidStat({ label, value }) {
  return <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 px-3 py-3">
    <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-1 truncate font-clash text-base text-slate-100">{value}</p>
  </div>
}
