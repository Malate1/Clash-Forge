import { formatNumber } from '../utils/format.js'

export default function RosterReadiness({ clan, members }) {
  const requirements = [
    { label: 'Town Hall', key: 'townHallLevel', min: clan.requiredTownhallLevel },
    { label: 'Home trophies', key: 'trophies', min: clan.requiredTrophies },
    { label: 'Builder Base trophies', key: 'builderBaseTrophies', min: clan.requiredBuilderBaseTrophies },
  ].filter((rule) => Number(rule.min) > 0)

  if (!requirements.length) return null

  const belowByRule = requirements.map((rule) => ({
    ...rule,
    below: members.filter((member) => member[rule.key] != null && Number(member[rule.key]) < Number(rule.min)).length,
    unknown: members.filter((member) => member[rule.key] == null).length,
  }))
  const belowAny = members.filter((member) => requirements.some((rule) =>
    member[rule.key] != null && Number(member[rule.key]) < Number(rule.min)
  )).length
  const unknownAny = members.filter((member) => requirements.some((rule) => member[rule.key] == null)).length

  return <section className="rounded-2xl border border-slate-700/50 bg-[#182030] p-5 shadow-md">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div><h3 className="font-clash text-xl uppercase tracking-wide text-slate-100">Roster requirements</h3>
        <p className="mt-1 text-xs text-slate-400">Current members compared with the clan’s public join requirements.</p></div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${belowAny ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
        {belowAny ? `${belowAny} below a requirement` : unknownAny ? `${unknownAny} need a data check` : 'All listed members meet requirements'}
      </span>
    </div>
    <div className="grid sm:grid-cols-3 gap-2">
      {belowByRule.map((rule) => <div key={rule.key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/40 bg-slate-900/30 px-3 py-2.5">
        <span className="text-xs text-slate-300">{rule.label} <span className="text-slate-500">≥ {formatNumber(rule.min)}</span></span>
        <span className="shrink-0 text-xs font-semibold text-slate-400">{rule.below} below{rule.unknown ? ` · ${rule.unknown} unknown` : ''}</span>
      </div>)}
    </div>
  </section>
}
