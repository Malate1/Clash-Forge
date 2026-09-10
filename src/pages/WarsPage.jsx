import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCurrentWar, getWarLog, getLeagueGroup, normalizeTag, CocApiError } from '../api/coc.js'
import CurrentWar from '../components/CurrentWar.jsx'
import WarLog from '../components/WarLog.jsx'
import CwlGroup from '../components/CwlGroup.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

const TABS = [
  { key: 'current', label: 'Current War' },
  { key: 'log', label: 'War Log' },
  { key: 'cwl', label: 'CWL' }
]

export default function WarsPage() {
  const { tag } = useParams()
  const [activeTab, setActiveTab] = useState('current')

  // Cache each tab's data independently so switching tabs doesn't refetch.
  const [data, setData] = useState({ current: null, log: null, cwl: null })
  const [loading, setLoading] = useState({ current: false, log: false, cwl: false })
  const [error, setError] = useState({ current: null, log: null, cwl: null })

  useEffect(() => {
    setData({ current: null, log: null, cwl: null })
    setError({ current: null, log: null, cwl: null })
    setActiveTab('current')
  }, [tag])

  useEffect(() => {
    if (data[activeTab] !== null || loading[activeTab]) return

    const fetchers = {
      current: () => getCurrentWar(tag),
      log: () => getWarLog(tag),
      cwl: () => getLeagueGroup(tag)
    }

    setLoading((l) => ({ ...l, [activeTab]: true }))
    setError((e) => ({ ...e, [activeTab]: null }))

    fetchers[activeTab]()
      .then((res) => setData((d) => ({ ...d, [activeTab]: res })))
      .catch((err) => {
        setError((e) => ({
          ...e,
          [activeTab]: err instanceof CocApiError ? err.message : 'Unexpected error.'
        }))
      })
      .finally(() => setLoading((l) => ({ ...l, [activeTab]: false })))
  }, [activeTab, tag]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Header section with title and back action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div>
          <h1 className="font-clash text-3xl text-slate-100 uppercase tracking-wide">
            Clan Wars
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            Tag: #{normalizeTag(tag)}
          </p>
        </div>
        <Link
          to={`/clan/${encodeURIComponent(tag)}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs font-bold font-clash text-[#ffc800] hover:bg-slate-700/60 transition-colors shadow-sm"
        >
          ← Back to clan
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#0d121d] border border-slate-700/60 rounded-xl p-1 w-full sm:w-fit shadow-inner">
        {TABS.map((t) => {
          const active = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-clash font-bold uppercase tracking-wider rounded-lg transition-all duration-200 focus-ring ${
                active
                  ? 'bg-gradient-to-r from-amber-500 to-[#ffc800] text-slate-950 shadow-[0_0_12px_rgba(255,200,0,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* States */}
      {loading[activeTab] && (
        <LoadingState label={`Loading ${TABS.find((t) => t.key === activeTab)?.label}`} />
      )}
      {error[activeTab] && <ErrorState message={error[activeTab]} />}

      {!loading[activeTab] && !error[activeTab] && data[activeTab] && (
        <div className="pt-2">
          {activeTab === 'current' && (
            <CurrentWar war={data.current} clanTag={`#${normalizeTag(tag)}`} />
          )}
          {activeTab === 'log' && <WarLog items={data.log.items} />}
          {activeTab === 'cwl' && <CwlGroup group={data.cwl} />}
        </div>
      )}
    </div>
  )
}