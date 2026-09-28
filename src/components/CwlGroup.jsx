import { useState } from 'react'
import { getCwlWar, CocApiError } from '../api/coc.js'
import { warStateLabel } from '../utils/format.js'
import WarAttackDetails from './WarAttackDetails.jsx'
import { useMemo } from 'react'

function RoundWarRow({ war }) {
  const [showAttacks, setShowAttacks] = useState(false)
  if (!war) return null
  return (
    <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center justify-between gap-3 md:gap-4 hover:border-slate-500/80 transition-all duration-200 shadow-md overflow-hidden">
      <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 min-w-0">
        <span className="px-2.5 py-1 text-xs font-clash font-extrabold uppercase tracking-wider border rounded-lg shrink-0 border-slate-600/50 bg-slate-800/80 text-slate-300 shadow-sm">
          {warStateLabel(war.state)}
        </span>

        <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-3 min-w-0">
          {/* Clan */}
          <div className="flex-1 sm:flex-none sm:min-w-[140px] md:min-w-[160px] min-w-0 flex items-center gap-1.5 sm:gap-2 justify-end">
            <span className="text-slate-100 font-semibold text-xs sm:text-sm truncate text-right max-w-[88px] sm:max-w-none">
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
          <div className="px-2 sm:px-3 py-1 bg-[#0d121d] rounded-lg border border-slate-800 shrink-0 font-clash text-base sm:text-lg font-bold text-[#ffc800] tracking-wide shadow-inner whitespace-nowrap">
            {war.clan?.stars ?? 0}{' '}
            <span className="text-slate-500 text-sm font-sans mx-0.5">–</span>{' '}
            {war.opponent?.stars ?? 0}
          </div>

          {/* Opponent */}
          <div className="flex-1 sm:flex-none sm:min-w-[140px] md:min-w-[160px] min-w-0 flex items-center gap-1.5 sm:gap-2">
            {war.opponent?.badgeUrls?.small && (
              <img
                src={war.opponent.badgeUrls.small}
                alt=""
                className="w-7 h-7 object-contain shrink-0 drop-shadow"
              />
            )}
            <span className="text-slate-100 font-semibold text-xs sm:text-sm truncate max-w-[88px] sm:max-w-none">
              {war.opponent?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Destruction % + attack details action */}
      <div className="w-full md:w-auto md:ml-auto flex items-center justify-between md:justify-end gap-3 text-[10px] sm:text-xs font-mono text-slate-400 shrink-0 border-t md:border-t-0 md:border-l border-slate-700/50 pt-2 md:pt-0 md:pl-4 py-0.5 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 whitespace-nowrap">
            {war.clan?.destructionPercentage?.toFixed?.(1) ?? 0}%
          </span>
          <span className="text-slate-600">vs</span>
          <span className="text-slate-200 whitespace-nowrap">
            {war.opponent?.destructionPercentage?.toFixed?.(1) ?? 0}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAttacks((value) => !value)}
          className="rounded-lg bg-[#2a77f4] px-3 py-1.5 font-clash text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#3d85f5] focus-ring"
        >
          {showAttacks ? 'Hide' : 'View'}
        </button>
      </div>

      {showAttacks && (
        <div className="w-full md:basis-full">
          <WarAttackDetails war={war} onClose={() => setShowAttacks(false)} />
        </div>
      )}
    </div>
  )
}

function Round({ index, warTags, onWarsLoaded }) {
  const [wars, setWars] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const realTags = warTags.filter((t) => t && t !== '#0')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(realTags.map((tag) => getCwlWar(tag)))
      setWars(results)
      onWarsLoaded(index, results)
    } catch (err) {
      setError(err instanceof CocApiError ? err.message : 'Could not load this round.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0f1523] border border-slate-800 rounded-xl p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-clash text-lg font-bold text-slate-200 uppercase tracking-wide">
          Round {index + 1}
        </h4>
        {!wars && (
          <button
            onClick={load}
            disabled={loading || realTags.length === 0}
            className="px-3 py-1 text-xs font-clash font-bold uppercase tracking-wider rounded-lg bg-slate-800 border border-slate-700 text-[#ffc800] hover:bg-slate-700 hover:text-amber-300 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:hover:text-[#ffc800] transition-colors focus-ring"
          >
            {loading ? 'Loading…' : realTags.length === 0 ? 'Not started' : 'Load results'}
          </button>
        )}
      </div>
      {error && (
        <p className="text-rose-400 text-xs mb-3 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5">
          {error}
        </p>
      )}
      {wars && (
        <div className="space-y-3">
          {wars.map((war, i) => (
            <RoundWarRow key={i} war={war} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CwlGroup({ group, clanTag }) {
  const [roundWars, setRoundWars] = useState({})
  const participation = useMemo(() => {
    const stats = new Map()
    Object.values(roundWars).flat().forEach((war) => {
      const ownSide = [war.clan, war.opponent].find((side) => side?.tag === clanTag)
      if (!ownSide) return
      ;(ownSide.members || []).forEach((member) => {
        const row = stats.get(member.tag) || { ...member, roundsPlayed: 0, attacks: 0, stars: 0, destruction: 0 }
        const attacks = member.attacks || []
        if (attacks.length) row.roundsPlayed += 1
        row.attacks += attacks.length
        row.stars += attacks.reduce((sum, attack) => sum + (attack.stars || 0), 0)
        row.destruction += attacks.reduce((sum, attack) => sum + (attack.destructionPercentage || 0), 0)
        stats.set(member.tag, row)
      })
    })
    return [...stats.values()].sort((a, b) => b.roundsPlayed - a.roundsPlayed || b.stars - a.stars)
  }, [roundWars, clanTag])

  if (!group || group.state === 'notInWar') {
    return (
      <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-8 text-center text-slate-400 text-sm shadow-md">
        This clan isn't currently in a Clan War League season.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Group Clan Grid */}
      <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-700/60 pb-3">
          <span className="text-[#ffc800] font-clash font-bold text-xl uppercase tracking-wide drop-shadow-sm">
            CWL {group.season || ''}
          </span>
          <span className="text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {warStateLabel(group.state)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {group.clans?.map((c) => (
            <div
              key={c.tag}
              className="bg-[#0d121d] border border-slate-700/60 rounded-lg px-3 py-2.5 flex items-center gap-2.5 hover:border-slate-600 transition-colors"
            >
              {c.badgeUrls?.small && (
                <img
                  src={c.badgeUrls.small}
                  alt=""
                  className="w-7 h-7 shrink-0 object-contain drop-shadow"
                />
              )}
              <div className="min-w-0">
                <p className="text-slate-100 font-semibold text-sm truncate">{c.name}</p>
                <p className="text-slate-400 text-xs font-mono">Lvl {c.clanLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rounds Section */}
      <div className="space-y-4">
        {group.rounds?.map((round, i) => (
          <Round key={i} index={i} warTags={round.warTags || []} onWarsLoaded={(roundIndex, wars) => setRoundWars((current) => ({ ...current, [roundIndex]: wars }))} />
        ))}
      </div>

      {participation.length > 0 && <div className="rounded-2xl border border-slate-700/50 bg-[#182030] p-5 shadow-md">
        <h3 className="font-clash text-xl uppercase tracking-wide text-slate-100">CWL player participation</h3>
        <p className="mt-1 mb-4 text-xs text-slate-400">Totals from rounds loaded above. Unloaded rounds are not included.</p>
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full min-w-[620px] text-sm">
            <thead><tr className="bg-slate-900/60 text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">Player</th><th className="px-4 py-3 text-right">Rounds played</th><th className="px-4 py-3 text-right">Attacks</th><th className="px-4 py-3 text-right">Stars</th><th className="px-4 py-3 text-right">Avg. destruction</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-700/40">{participation.map((member) => <tr key={member.tag}>
              <td className="px-4 py-3 font-semibold text-slate-200">{member.name}</td>
              <td className="px-4 py-3 text-right text-slate-300">{member.roundsPlayed}</td>
              <td className="px-4 py-3 text-right text-slate-300">{member.attacks}</td>
              <td className="px-4 py-3 text-right font-clash text-[#ffc800]">{member.stars}</td>
              <td className="px-4 py-3 text-right text-slate-300">{member.attacks ? `${(member.destruction / member.attacks).toFixed(1)}%` : '—'}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>}
    </div>
  )
}
