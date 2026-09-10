import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPlayer, CocApiError } from '../api/coc.js'
import PlayerHeader from '../components/PlayerHeader.jsx'
import PlayerTroops from '../components/PlayerTroops.jsx'
import PlayerAchievements from '../components/PlayerAchievements.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function PlayerPage() {
  const { tag } = useParams()
  const [player, setPlayer] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPlayer(null)

    getPlayer(tag)
      .then((res) => !cancelled && setPlayer(res))
      .catch((err) => !cancelled && setError(err instanceof CocApiError ? err.message : 'Unexpected error.'))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [tag])

  if (loading) return <LoadingState label="Fetching player" />
  if (error) return <ErrorState message={error} />
  if (!player) return null

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      <PlayerHeader player={player} />
      <PlayerTroops player={player} />
      <PlayerAchievements player={player} />
    </div>
  )
}