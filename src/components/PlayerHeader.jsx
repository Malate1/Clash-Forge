import { Link } from 'react-router-dom'
import StatPanel from './StatPanel.jsx'
import ItemIcon from './ItemIcon.jsx'
import { formatNumber, roleLabel, thColor, trophyTier } from '../utils/format.js'

const WAR_PREF_LABEL = { in: 'Opted in', out: 'Opted out' }

export default function PlayerHeader({ player }) {
  return (
    <div className="bg-[#182030] border-2 border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        {/* Town Hall Image Banner */}
        {/* Town Hall Image Banner */}
<div className="w-20 h-20 shrink-0 flex items-center justify-center">
  <ItemIcon
    kind="townhall"
    level={player.townHallLevel}
    className="w-full h-full object-contain drop-shadow-md"
  />
</div>

        {/* Player Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-clash text-3xl sm:text-4xl font-extrabold text-white leading-none tracking-wide drop-shadow-sm">
              {player.name}
            </h1>
            <span className="text-slate-400 font-mono text-xs tracking-wider">
              {player.tag}
            </span>
          </div>

          <div className="mt-2 text-sm text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
            <span className="text-slate-200">
              Level {player.expLevel}
            </span>
            {/* <span className="text-slate-600">·</span> */}
            {/* <span className="text-[#ffc800] font-semibold">
              {trophyTier(player.trophies)} league
            </span> */}

            {player.clan && (
              <>
                <span className="text-slate-600">·</span>
                <div className="inline-flex items-center gap-1.5 bg-[#0f141e] px-2.5 py-0.5 rounded-lg border border-slate-700/60">
                  {player.clan.badgeUrls?.small && (
                    <img src={player.clan.badgeUrls.small} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <Link
                    to={`/clan/${encodeURIComponent(player.clan.tag.replace('#', ''))}`}
                    className="text-[#ffc800] hover:text-yellow-300 font-bold transition-colors"
                  >
                    {player.clan.name}
                  </Link>
                  <span className="text-slate-400 text-xs">
                    ({roleLabel(player.role)})
                  </span>
                </div>
              </>
            )}

            {player.warPreference && (
              <>
                <span className="text-slate-600">·</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                    player.warPreference === 'in'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  War: {WAR_PREF_LABEL[player.warPreference] || player.warPreference}
                </span>
              </>
            )}
          </div>

          {/* Player Labels */}
          {player.labels?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {player.labels.map((label) => (
                <span
                  key={label.id}
                  className="flex items-center gap-1.5 bg-[#0f141e] border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-semibold shadow-inner"
                >
                  {label.iconUrls?.small && (
                    <img src={label.iconUrls.small} alt="" className="w-4 h-4 object-contain" />
                  )}
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Home village stats */}
      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Home Village Stats
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <StatPanel label="Trophies" value={formatNumber(player.trophies)} accent />
          <StatPanel label="Best trophies" value={formatNumber(player.bestTrophies)} />
          <StatPanel label="War stars" value={formatNumber(player.warStars)} />
          <StatPanel label="Attack wins" value={formatNumber(player.attackWins)} />
          <StatPanel label="Defense wins" value={formatNumber(player.defenseWins)} />
          <StatPanel
            label="Donations sent / received"
            value={`${formatNumber(player.donations)} / ${formatNumber(player.donationsReceived)}`}
          />
        </div>
      </div>

      {/* Builder base + clan capital stats */}
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Builder Base & Capital
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <StatPanel label="Builder hall level" value={player.builderHallLevel ?? '—'} />
          <StatPanel label="Builder trophies" value={formatNumber(player.builderBaseTrophies)} />
          <StatPanel label="Best builder trophies" value={formatNumber(player.bestBuilderBaseTrophies)} />
          <StatPanel label="Builder base league" value={player.builderBaseLeague?.name || '—'} />
          <StatPanel label="Multiplayer league tier" value={player.leagueTier?.name || '—'} />
          <StatPanel label="Capital gold contributed" value={formatNumber(player.clanCapitalContributions)} />
        </div>
      </div>
    </div>
  )
}