import { formatNumber } from '../utils/format.js'

export default function ClanCapital({ clanCapital }) {
  if (!clanCapital) return null

  return (
    <div className="space-y-4">
      <h2 className="font-clash text-2xl text-[#ffc800] uppercase tracking-wide drop-shadow-sm">
        Clan Capital
      </h2>
      <div className="bg-[#182030] border-2 border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0f141e] border border-slate-700/60 rounded-xl px-4 py-3 shadow-inner">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Capital hall level
            </p>
            <p className="font-clash text-2xl text-[#ffc800] leading-none drop-shadow-sm">
              {clanCapital.capitalHallLevel ?? '—'}
            </p>
          </div>
          <div className="bg-[#0f141e] border border-slate-700/60 rounded-xl px-4 py-3 shadow-inner">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Gold sink total
            </p>
            <p className="font-clash text-2xl text-white leading-none drop-shadow-sm">
              {formatNumber(clanCapital.clanGoldSinkTotal)}
            </p>
          </div>
        </div>

        {clanCapital.districts?.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Districts
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {clanCapital.districts.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#242f45] border border-slate-600/50 rounded-xl px-4 py-3 flex items-center justify-between hover:border-slate-500/80 transition-colors"
                >
                  <span className="text-slate-200 text-sm font-semibold truncate pr-2">
                    {d.name}
                  </span>
                  <span className="font-clash text-lg text-[#ffc800] shrink-0 drop-shadow-sm">
                    {d.districtHallLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}