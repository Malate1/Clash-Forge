import { formatDate } from '../utils/format.js'

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

export default function WarLog({ items }) {
  // Filter out any war entry where the opponent name is missing or "Unknown"
  const validItems = items?.filter(
    (war) => war.opponent?.name && war.opponent.name.toLowerCase() !== 'unknown'
  )

  if (!validItems || validItems.length === 0) {
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
        return (
          <div
            key={i}
            className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-500/80 transition-all duration-200 shadow-md"
          >
            {/* Result Tag & Matchup Section */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              <span
                className={`px-3 py-1 text-xs font-clash font-extrabold uppercase tracking-wider border rounded-lg shrink-0 ${style.className}`}
              >
                {style.label}
              </span>

              <div className="flex items-center gap-3">
                {/* Clan */}
                <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[170px] justify-end">
                  <span className="text-slate-100 font-semibold text-sm truncate text-right">
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

                {/* Score */}
                <div className="px-3 py-1 bg-[#0d121d] rounded-lg border border-slate-800 shrink-0 font-clash text-lg font-bold text-[#ffc800] tracking-wide shadow-inner">
                  {war.clan?.stars ?? 0}{' '}
                  <span className="text-slate-500 text-sm font-sans mx-0.5">–</span>{' '}
                  {war.opponent?.stars ?? 0}
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[170px]">
                  {war.opponent?.badgeUrls?.small && (
                    <img
                      src={war.opponent.badgeUrls.small}
                      alt=""
                      className="w-7 h-7 object-contain shrink-0 drop-shadow"
                    />
                  )}
                  <span className="text-slate-100 font-semibold text-sm truncate">
                    {war.opponent.name}
                  </span>
                </div>
              </div>
            </div>

            {/* War Meta Info */}
            <div className="ml-auto flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0 border-l border-slate-700/50 pl-4 py-0.5">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {war.teamSize}v{war.teamSize}
              </span>
              <span className="text-slate-300">
                {war.clan?.destructionPercentage?.toFixed?.(1) ?? 0}%
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-400">{formatDate(war.endTime)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}