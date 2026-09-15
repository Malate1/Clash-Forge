function buildMemberMap(side) {
  return new Map((side?.members || []).map((member) => [member.tag, member]))
}

function collectAttacks(side) {
  return (side?.members || [])
    .flatMap((member) => (member.attacks || []).map((attack) => ({ ...attack, attacker: member })))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
}

function TeamAttackList({ side, enemy }) {
  const attacks = collectAttacks(side)
  const enemyMembers = buildMemberMap(enemy)

  return (
    <div className="min-w-0 rounded-2xl border border-slate-700/60 bg-[#0f1523] p-4 sm:p-5">
      <div className="mb-4 flex min-w-0 items-center gap-3 border-b border-slate-700/50 pb-3">
        {side?.badgeUrls?.small && (
          <img src={side.badgeUrls.small} alt="" className="h-9 w-9 shrink-0 object-contain" />
        )}
        <div className="min-w-0">
          <p className="truncate font-clash text-lg uppercase tracking-wide text-slate-100">
            {side?.name || 'Unknown'}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {attacks.length} recorded attack{attacks.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {attacks.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No attacks recorded yet.</p>
      ) : (
        <div className="space-y-2.5">
          {attacks.map((attack, index) => {
            const defender = enemyMembers.get(attack.defenderTag)
            return (
              <div
                key={`${attack.attackerTag}-${attack.defenderTag}-${attack.order ?? index}`}
                className="rounded-xl border border-slate-700/50 bg-[#182030] p-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 px-1.5 font-mono text-[10px] font-bold text-slate-400">
                    #{attack.order ?? index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
                      <span className="min-w-0 flex-1 truncate font-semibold text-slate-100">
                        {attack.attacker?.name || attack.attackerTag}
                      </span>
                      <span className="shrink-0 text-slate-600">→</span>
                      <span className="min-w-0 flex-1 truncate text-right font-semibold text-slate-100">
                        {defender?.name || attack.defenderTag}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span>
                        TH {attack.attacker?.townhallLevel ?? '—'} → TH {defender?.townhallLevel ?? '—'}
                      </span>
                      <span className="font-bold text-[#ffc800]">{attack.stars ?? 0} ★</span>
                      <span>{attack.destructionPercentage ?? 0}%</span>
                      {attack.duration != null && <span>{attack.duration}s</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function WarAttackDetails({ war, onClose }) {
  if (!war) return null

  return (
    <div className="mt-4 rounded-2xl border border-slate-700/60 bg-[#0d121d] p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-clash text-lg uppercase tracking-wide text-[#ffc800]">Attack details</p>
          <p className="mt-0.5 text-xs text-slate-500">Every recorded attack from both teams</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TeamAttackList side={war.clan} enemy={war.opponent} />
        <TeamAttackList side={war.opponent} enemy={war.clan} />
      </div>
    </div>
  )
}
