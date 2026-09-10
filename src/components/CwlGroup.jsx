import { useState } from 'react'
import { getCwlWar, CocApiError } from '../api/coc.js'
import { warStateLabel } from '../utils/format.js'

function RoundWarRow({ war }) {
  if (!war) return null
  return (
    <div className="bg-[#182030] border-2 border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-500/80 transition-all duration-200 shadow-md">
      <div className="flex flex-wrap items-center gap-4 min-w-0">
        <span className="px-2.5 py-1 text-xs font-clash font-extrabold uppercase tracking-wider border rounded-lg shrink-0 border-slate-600/50 bg-slate-800/80 text-slate-300 shadow-sm">
          {warStateLabel(war.state)}
        </span>

        <div className="flex items-center gap-3">
          {/* Clan */}
          <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[160px] justify-end">
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
          <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[160px]">
            {war.opponent?.badgeUrls?.small && (
              <img
                src={war.opponent.badgeUrls.small}
                alt=""
                className="w-7 h-7 object-contain shrink-0 drop-shadow"
              />
            )}
            <span className="text-slate-100 font-semibold text-sm truncate">
              {war.opponent?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Destruction % */}
      <div className="ml-auto flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0 border-l border-slate-700/50 pl-4 py-0.5">
        <span className="text-slate-200">
          {war.clan?.destructionPercentage?.toFixed?.(1) ?? 0}%
        </span>
        <span className="text-slate-600">vs</span>
        <span className="text-slate-200">
          {war.opponent?.destructionPercentage?.toFixed?.(1) ?? 0}%
        </span>
      </div>
    </div>
  )
}

function Round({ index, warTags }) {
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

export default function CwlGroup({ group }) {
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
          <Round key={i} index={i} warTags={round.warTags || []} />
        ))}
      </div>
    </div>
  )
}