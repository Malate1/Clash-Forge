import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClan, getClanMembers, CocApiError } from '../api/coc.js'
import ClanHeader from '../components/ClanHeader.jsx'
import ClanCapital from '../components/ClanCapital.jsx'
import MemberTable from '../components/MemberTable.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function ClanPage() {
  const { tag } = useParams()
  const [clan, setClan] = useState(null)
  const [members, setMembers] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setClan(null)
    setMembers(null)

    Promise.all([getClan(tag), getClanMembers(tag)])
      .then(([clanRes, membersRes]) => {
        if (cancelled) return
        setClan(clanRes)
        setMembers(membersRes.items || [])
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof CocApiError ? err.message : 'Unexpected error.')
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [tag])

  if (loading) return <LoadingState label="Fetching clan" />
  if (error) return <ErrorState message={error} />
  if (!clan) return null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-end">
        <Link
          to={`/clan/${encodeURIComponent(tag)}/wars`}
          className="font-clash bg-[#2a77f4] hover:bg-[#3d85f5] text-white font-normal uppercase tracking-wider text-sm px-6 py-3 rounded-xl shadow-[0_4px_0_#1a56b8] hover:shadow-[0_2px_0_#1a56b8] hover:translate-y-[2px] transition-all focus-ring"
        >
          Wars &amp; War Log →
        </Link>
      </div>
      <ClanHeader clan={clan} />
      <ClanCapital clanCapital={clan.clanCapital} />
      <div className="space-y-4">
        <h2 className="font-clash text-2xl text-[#ffc800] uppercase tracking-wide drop-shadow-sm">
          Roster
        </h2>
        <MemberTable members={members} />
      </div>
    </div>
  )
}