import { useMemo, useState } from 'react'
import { formatDate } from '../utils/format.js'
import { findArchivedRegularWar } from '../utils/warArchive.js'
import WarAttackDetails from './WarAttackDetails.jsx'

const RESULT_STYLE = {
  win: {
    label: 'Win',
    className:
      'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_8px_rgba(52,211,153,0.15)]'
  },
  lose: {
    label: 'Loss',
    className:
      'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
  },
  tie: {
    label: 'Tie',
    className: 'text-slate-400 border-slate-600/50 bg-slate-800/50'
  }
}

export default function WarLog({ items, clanTag }) {
  const [openIndex, setOpenIndex] = useState(null)

  const validItems = useMemo(
    () =>
      items?.filter(
        (war) => war.opponent?.name && war.opponent.name.toLowerCase() !== 'unknown'
      ) || [],
    [items]
  )

  if (validItems.length === 0) {
    return (
      <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-8 text-center text-slate-400 text-sm shadow-md">
        No past wars found.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {validItems.map((war, i) => {
        const style = RESULT_STYLE[war.result] || RESULT_STYLE.tie
        const archivedWar = findArchivedRegularWar(war, clanTag)
        const isOpen = openIndex === i

        return (
          <div key={`${war.endTime || i}-${war.opponent?.tag || i}`} className="space-y-2">
            <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center justify-between gap-3 md:gap-4 hover:border-slate-500/80 transition-all duration-200 shadow-md overflow-hidden">
              <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 min-w-0">
                <span
                  className={`px-3 py-1 text-xs font-clash font-extrabold uppercase tracking-wider border rounded-lg shrink-0 ${style.className}`}
                >
                  {style.label}
                </span>

                <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-3 min-w-0">
                  <div className="flex-1 sm:flex-none sm:min-w-[140px] md:min-w-[170px] min-w-0 flex items-center gap-1.5 sm:gap-2 justify-end">
                    <span className="text-slate-100 font-semibold text-xs sm:text-sm truncate text-right max-w-[90px] sm:max-w-none">
                      {war.clan?.name || 'Unknown'}
                    </span>
                    {war.clan?.badgeUrls?.small && (
                      <img
                        src={war.clan.badgeUrls.small}
                        alt=""
                        className="w-7 h-7 object-contain shrink-0 drop-shadow"
                      />
                    )}
                  </div>

                  <div className="px-2 sm:px-3 py-1 bg-[#0d121d] rounded-lg border border-slate-800 shrink-0 font-clash text-base sm:text-lg font-bold text-[#ffc800] tracking-wide shadow-inner whitespace-nowrap">
                    {war.clan?.stars ?? 0}{' '}
                    <span className="text-slate-500 text-sm font-sans mx-0.5">–</span>{' '}
                    {war.opponent?.stars ?? 0}
                  </div>

                  <div className="flex-1 sm:flex-none sm:min-w-[140px] md:min-w-[170px] min-w-0 flex items-center gap-1.5 sm:gap-2">
                    {war.opponent?.badgeUrls?.small && (
                      <img
                        src={war.opponent.badgeUrls.small}
                        alt=""
                        className="w-7 h-7 object-contain shrink-0 drop-shadow"
                      />
                    )}
                    <span className="text-slate-100 font-semibold text-xs sm:text-sm truncate max-w-[90px] sm:max-w-none">
                      {war.opponent.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto md:ml-auto flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono text-slate-400 shrink-0 border-t md:border-t-0 md:border-l border-slate-700/50 pt-2 md:pt-0 md:pl-4 py-0.5 overflow-hidden">
                <span className="bg-slate-800 text-slate-300 px-1.5 sm:px-2 py-0.5 rounded border border-slate-700 shrink-0">
                  {war.teamSize}v{war.teamSize}
                </span>
                <span className="text-slate-300">
                  {war.clan?.destructionPercentage?.toFixed?.(1) ?? 0}%
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-400 whitespace-nowrap">{formatDate(war.endTime)}</span>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="ml-1 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 font-clash text-[10px] uppercase tracking-wider text-[#ffc800] transition-colors hover:border-slate-500 hover:bg-slate-800"
                >
                  {isOpen ? 'Hide' : 'View'}
                </button>
              </div>
            </div>

            {isOpen && (
              archivedWar ? (
                <WarAttackDetails war={archivedWar} onClose={() => setOpenIndex(null)} />
              ) : (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-slate-300">
                  <p className="font-clash uppercase tracking-wide text-[#ffc800]">Attack details unavailable</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Supercell's regular war log only provides the final summary for completed wars. Full attack events will appear here for wars that Clash Forge captured while they were still current.
                  </p>
                </div>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}
