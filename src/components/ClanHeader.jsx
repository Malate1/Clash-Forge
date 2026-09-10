import StatPanel from './StatPanel.jsx'
import { formatNumber } from '../utils/format.js'

export default function ClanHeader({ clan }) {
  const badge = clan.badgeUrls?.medium

  return (
    <div className="bg-[#182030] border-2 border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
        {badge ? (
          <img src={badge} alt="" className="w-24 h-24 shrink-0 drop-shadow-md object-contain" />
        ) : (
          <div className="w-24 h-24 shrink-0 bg-[#0f141e] border-2 border-slate-700/50 rounded-xl" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-clash text-3xl sm:text-4xl text-white uppercase tracking-wider drop-shadow-sm">
              {clan.name}
            </h1>
            <span className="text-slate-400 font-semibold text-sm">{clan.tag}</span>
          </div>
          <p className="mt-2 text-slate-300 text-sm max-w-xl leading-relaxed whitespace-pre-line font-medium">
            {clan.description || 'No description set.'}
          </p>

          {/* Badges: type, location, war frequency, war log visibility, family friendly, chat language */}
          <div className="font-clash mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="bg-[#0f141e] border border-slate-700/60 px-3 py-1 rounded-lg text-slate-300">
              {clan.type === 'inviteOnly' ? 'Invite only' : clan.type === 'closed' ? 'Closed' : 'Open'}
            </span>
            {clan.location?.name && (
              <span className="bg-[#0f141e] border border-slate-700/60 px-3 py-1 rounded-lg text-slate-300">
                {clan.location.name}
                {clan.location.isCountry && clan.location.countryCode ? ` (${clan.location.countryCode})` : ''}
              </span>
            )}
            {clan.warFrequency && (
              <span className="bg-[#0f141e] border border-slate-700/60 px-3 py-1 rounded-lg text-slate-300">
                Wars: {clan.warFrequency.toLowerCase()}
              </span>
            )}
            <span className="bg-[#0f141e] border border-slate-700/60 px-3 py-1 rounded-lg text-slate-300">
              War log: {clan.isWarLogPublic ? 'Public' : 'Private'}
            </span>
            {clan.isFamilyFriendly && (
              <span className="bg-[#0f141e] border border-slate-700/60 px-3 py-1 rounded-lg text-slate-300">
                Family friendly
              </span>
            )}
            {clan.chatLanguage?.name && (
              <span className="bg-[#0f141e] border border-slate-700/60 px-3 py-1 rounded-lg text-slate-300">
                Chat: {clan.chatLanguage.name}
              </span>
            )}
          </div>

          {/* Clan labels */}
          {clan.labels?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {clan.labels.map((label) => (
                <span
                  key={label.id}
                  className="flex items-center gap-2 bg-[#242f45] border border-slate-600/50 px-3 py-1 rounded-lg text-xs font-semibold text-slate-200"
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

      {/* Core stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatPanel label="Members" value={`${clan.members}/50`} accent />
        <StatPanel label="Clan level" value={clan.clanLevel} />
        <StatPanel label="Clan points" value={formatNumber(clan.clanPoints)} />
        <StatPanel label="Builder base points" value={formatNumber(clan.clanBuilderBasePoints)} />
        <StatPanel label="Capital points" value={formatNumber(clan.clanCapitalPoints)} />
        <StatPanel label="Capital league" value={clan.capitalLeague?.name || '—'} />
      </div>

      {/* War stats */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatPanel label="War league" value={clan.warLeague?.name?.replace('War League', '').trim() || '—'} />
        <StatPanel label="War win streak" value={clan.warWinStreak ?? '—'} />
        <StatPanel
          label="War record (W-L-T)"
          value={`${clan.warWins ?? 0}-${clan.warLosses ?? 0}-${clan.warTies ?? 0}`}
        />
        <StatPanel label="Required trophies" value={formatNumber(clan.requiredTrophies)} />
        <StatPanel label="Req. builder trophies" value={formatNumber(clan.requiredBuilderBaseTrophies)} />
        <StatPanel label="Req. town hall" value={clan.requiredTownhallLevel ?? '—'} />
      </div>
    </div>
  )
}