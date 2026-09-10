const VILLAGE_LABEL = {
  home: 'Home Village',
  builderBase: 'Builder Base',
  clanCapital: 'Clan Capital'
}

function Stars({ count }) {
  return (
    <span className="flex items-center text-sm tracking-tight" title={`${count}/3 stars`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={
            i < count
              ? 'text-[#ffc800] drop-shadow-[0_0_4px_rgba(255,200,0,0.6)]'
              : 'text-slate-700'
          }
        >
          ★
        </span>
      ))}
    </span>
  )
}

function Group({ village, items }) {
  if (!items.length) return null
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-clash text-xl text-[#ffc800] uppercase tracking-wide drop-shadow-sm">
          {VILLAGE_LABEL[village] || village}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          {items.length}
        </span>
      </div>

      <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl overflow-hidden shadow-md divide-y divide-slate-700/40">
        {items.map((a, idx) => {
          const pct =
            a.target > 0 ? Math.min(100, Math.round((a.value / a.target) * 100)) : 100
          const maxed = a.stars >= 3 || pct >= 100

          return (
            <div
              key={`${a.name}-${a.village || village}-${idx}`}
              className="p-3.5 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex justify-between items-baseline gap-3 text-sm mb-1.5">
                <span className="text-slate-100 font-semibold flex items-center gap-2.5 min-w-0">
                  <span className="truncate">{a.name}</span>
                  <Stars count={a.stars} />
                </span>
                <span className="text-slate-400 font-mono text-xs shrink-0">
                  {a.value.toLocaleString()} / {a.target.toLocaleString()}
                </span>
              </div>

              {a.info && (
                <p className="text-slate-400 text-xs mb-2 leading-relaxed">{a.info}</p>
              )}

              <div className="w-full bg-[#0d121d] rounded-full h-2 overflow-hidden border border-slate-800/80 shadow-inner">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    maxed
                      ? 'bg-gradient-to-r from-amber-500 to-[#ffc800] shadow-[0_0_8px_rgba(255,200,0,0.6)]'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PlayerAchievements({ player }) {
  const all = player.achievements || []
  if (!all.length) return null

  const byVillage = {
    home: all.filter((a) => a.village === 'home'),
    builderBase: all.filter((a) => a.village === 'builderBase'),
    clanCapital: all.filter((a) => a.village === 'clanCapital')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <h2 className="font-clash text-2xl text-slate-100 uppercase tracking-wide">
          Achievements
        </h2>
        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
          Total: {all.length}
        </span>
      </div>

      <Group village="home" items={byVillage.home} />
      <Group village="builderBase" items={byVillage.builderBase} />
      <Group village="clanCapital" items={byVillage.clanCapital} />
    </div>
  )
}