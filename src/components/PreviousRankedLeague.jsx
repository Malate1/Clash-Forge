import { useEffect, useState } from 'react'
import { getLeagueTier, getPlayerLeagueHistory } from '../api/coc.js'

function getHistoryEntries(response) {
  if (Array.isArray(response)) return response
  return response?.items || []
}

function formatSeason(seasonId) {
  if (seasonId == null || seasonId === '') return 'Previous season'
  const value = String(seasonId)
  const monthMatch = value.match(/^(\d{4})-(\d{2})/)
  if (monthMatch) {
    const date = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1)
    if (!Number.isNaN(date.getTime()) && date.getMonth() === Number(monthMatch[2]) - 1) {
      return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    }
  }
  return `Season ${value}`
}

export default function PreviousRankedLeague({ player }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fallback = player.legendStatistics?.previousSeason
    const hasHistory = Boolean(player.previousLeagueSeasonId || fallback)

    if (!hasHistory) {
      setResult(null)
      return () => { cancelled = true }
    }

    setResult({ loading: true, fallback })

    getPlayerLeagueHistory(player.tag)
      .then(async (response) => {
        const entries = getHistoryEntries(response)
        const targetSeasonId = player.previousLeagueSeasonId ?? fallback?.id
        const season = entries.find((entry) => String(entry.leagueSeasonId) === String(targetSeasonId))
          || entries[0]
          || null

        let tier = null
        if (season?.leagueTierId) {
          try {
            tier = await getLeagueTier(season.leagueTierId)
          } catch {
            // Keep the season result visible when tier metadata is unavailable.
          }
        }

        if (!cancelled) setResult({ season, tier, fallback })
      })
      .catch(() => {
        if (!cancelled) setResult({ season: null, tier: null, fallback })
      })

    return () => { cancelled = true }
  }, [player.tag, player.previousLeagueSeasonId, player.legendStatistics?.previousSeason])

  if (!result) return null

  const season = result.season
  const fallback = result.fallback
  const rank = season?.placement ?? fallback?.rank
  const trophies = season?.leagueTrophies ?? fallback?.trophies
  const seasonId = season?.leagueSeasonId ?? player.previousLeagueSeasonId ?? fallback?.id
  const tierName = result.tier?.name || (fallback ? 'Legend League' : null)

  if (!tierName && rank == null && trophies == null) return null

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-[#182030] p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {result.tier?.iconUrls?.medium || result.tier?.iconUrls?.small ? (
            <img
              src={result.tier.iconUrls.medium || result.tier.iconUrls.small}
              alt=""
              className="h-12 w-12 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-xl">🏆</div>
          )}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Previous ranked season</p>
            <h2 className="font-clash text-xl font-bold text-white">{tierName || 'League result'}</h2>
            <p className="text-sm text-slate-400">{formatSeason(seasonId)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {rank != null && (
            <div className="min-w-24 rounded-xl border border-slate-700/60 bg-[#0f141e] px-4 py-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Final rank</p>
              <p className="font-clash text-lg font-bold text-white">#{rank}</p>
            </div>
          )}
          {trophies != null && (
            <div className="min-w-24 rounded-xl border border-slate-700/60 bg-[#0f141e] px-4 py-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trophies</p>
              <p className="font-clash text-lg font-bold text-[#ffc800]">{trophies.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
