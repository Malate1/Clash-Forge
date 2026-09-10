import { formatNumber, formatDateTime, warStateLabel } from '../utils/format.js'

function SideCard({ side, accent = false }) {
  if (!side) return null

  return (
    <div
      className={`bg-[#0d121d] border-2 rounded-xl p-4 flex-1 min-w-[220px] shadow-inner transition-all duration-200 ${
        accent
          ? 'border-[#ffc800]/80 shadow-[0_0_15px_rgba(255,200,0,0.15)]'
          : 'border-slate-700/60'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        {side.badgeUrls?.small ? (
          <img
            src={side.badgeUrls.small}
            alt=""
            className="w-10 h-10 object-contain drop-shadow"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-slate-100 font-bold text-base truncate">
            {side.name || 'Unknown'}
          </p>
          <p className="text-slate-400 text-xs font-mono">Level {side.clanLevel ?? 0}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center divide-x divide-slate-800/60">
        <div>
          <p className="font-clash text-2xl font-extrabold text-[#ffc800] leading-none drop-shadow-sm">
            {side.stars ?? 0}
          </p>
          <p className="text-[10px] font-clash uppercase font-bold tracking-wider text-slate-400 mt-1.5">
            Stars
          </p>
        </div>
        <div className="pl-1">
          <p className="font-clash text-2xl font-bold text-slate-100 leading-none">
            {side.destructionPercentage?.toFixed?.(1) ?? 0}%
          </p>
          <p className="text-[10px] font-clash uppercase font-bold tracking-wider text-slate-400 mt-1.5">
            Destruction
          </p>
        </div>
        <div className="pl-1">
          <p className="font-clash text-2xl font-bold text-slate-100 leading-none">
            {side.attacks ?? 0}
          </p>
          <p className="text-[10px] font-clash uppercase font-bold tracking-wider text-slate-400 mt-1.5">
            Attacks
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CurrentWar({ war, clanTag }) {
  if (!war || war.state === 'notInWar') {
    return (
      <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-8 text-center text-slate-400 text-sm shadow-md">
        This clan isn't currently in a war.
      </div>
    )
  }

  const isClanUs = war.clan?.tag === clanTag
  const us = isClanUs ? war.clan : war.opponent
  const them = isClanUs ? war.opponent : war.clan

  return (
    <div className="space-y-6">
      {/* Main Status & Versus Card */}
      <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-700/60 pb-3">
          <span className="text-[#ffc800] font-clash font-bold text-xl uppercase tracking-wide drop-shadow-sm">
            {warStateLabel(war.state)}
          </span>
          <span className="text-slate-300 text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            Team size {war.teamSize} · {war.attacksPerMember ?? 2} attacks each
          </span>
        </div>

        <div className="flex flex-wrap gap-3 items-stretch">
          <SideCard side={us} accent />
          <div className="flex items-center justify-center font-clash text-2xl font-extrabold text-slate-500 px-2 select-none">
            VS
          </div>
          <SideCard side={them} />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
          {war.preparationStartTime && (
            <span>
              Prep started: <strong className="text-slate-200 font-normal">{formatDateTime(war.preparationStartTime)}</strong>
            </span>
          )}
          {war.startTime && (
            <span>
              Battle started: <strong className="text-slate-200 font-normal">{formatDateTime(war.startTime)}</strong>
            </span>
          )}
          {war.endTime && (
            <span>
              Ends: <strong className="text-slate-200 font-normal">{formatDateTime(war.endTime)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Roster Table */}
      {us?.members?.length > 0 && (
        <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl overflow-x-auto shadow-md">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-700/80 bg-[#0d121d] text-left">
                <th className="px-4 py-3 font-clash text-[11px] uppercase tracking-wider text-slate-400">
                  #
                </th>
                <th className="px-4 py-3 font-clash text-[11px] uppercase tracking-wider text-slate-400">
                  Name
                </th>
                <th className="px-4 py-3 font-clash text-[11px] uppercase tracking-wider text-slate-400">
                  TH
                </th>
                <th className="px-4 py-3 font-clash text-[11px] uppercase tracking-wider text-slate-400">
                  Attacks
                </th>
                <th className="px-4 py-3 font-clash text-[11px] uppercase tracking-wider text-slate-400">
                  Best stars
                </th>
                <th className="px-4 py-3 font-clash text-[11px] uppercase tracking-wider text-slate-400">
                  Best destruction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 font-mono text-xs">
              {[...us.members]
                .sort((a, b) => a.mapPosition - b.mapPosition)
                .map((m, i) => {
                  const best = m.attacks?.reduce(
                    (acc, atk) => (atk.stars > (acc?.stars ?? -1) ? atk : acc),
                    null
                  )
                  return (
                    <tr
                      key={m.tag}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        i % 2 === 1 ? 'bg-[#0f1523]/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-400 font-bold">{m.mapPosition}</td>
                      <td className="px-4 py-3 text-slate-100 font-sans font-semibold text-sm">
                        {m.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
                          {m.townhallLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {m.attacks?.length ?? 0}/{war.attacksPerMember ?? 2}
                      </td>
                      <td className="px-4 py-3 text-[#ffc800] font-bold text-sm">
                        {best ? `${best.stars} ★` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {best ? `${best.destructionPercentage}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}