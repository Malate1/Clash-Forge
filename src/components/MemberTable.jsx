import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemIcon from './ItemIcon.jsx'
import { formatNumber, roleLabel } from '../utils/format.js'

const COLUMNS = [
  { key: 'clanRank', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'expLevel', label: 'XP' },
  { key: 'leagueTier', label: 'League Tier' },
  { key: 'trophies', label: 'Trophies' },
  { key: 'builderBaseTrophies', label: 'Builder Trophies' },
  { key: 'donations', label: 'Donated' },
  { key: 'donationsReceived', label: 'Received' }
]

export default function MemberTable({ members = [] }) {
  const [sortKey, setSortKey] = useState('clanRank')
  const [asc, setAsc] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 1. Filter members by search input (name or tag)
  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const term = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.tag?.toLowerCase().includes(term)
    )
  }, [members, search])

  // 2. Sort filtered members
  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let av = a[sortKey] ?? 0
      let bv = b[sortKey] ?? 0
      if (sortKey === 'leagueTier') {
        av = a.leagueTier?.name || ''
        bv = b.leagueTier?.name || ''
      }
      if (typeof av === 'string') return asc ? av.localeCompare(bv) : bv.localeCompare(av)
      return asc ? av - bv : bv - av
    })
    return copy
  }, [filtered, sortKey, asc])

  // 3. Paginate sorted members
  const totalPages = Math.ceil(sorted.length / pageSize) || 1
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  function toggleSort(key) {
    if (key === sortKey) setAsc((a) => !a)
    else {
      setSortKey(key)
      setAsc(key === 'clanRank')
    }
  }

  function handleSearchChange(e) {
    setSearch(e.target.value)
    setPage(1) // Reset to page 1 on new query
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value))
    setPage(1)
  }

  return (
    <div className="bg-[#182030] border-2 border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
      {/* Controls: Search & Page Size */}
      <div className="p-4 sm:p-5 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#131a27]">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search member or tag..."
            className="w-full bg-[#0f141e] text-slate-200 text-sm border border-slate-700/70 rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:border-[#2a77f4] transition-colors placeholder:text-slate-500 font-medium"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-full sm:w-auto justify-end">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-[#0f141e] border border-slate-700/70 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#2a77f4] cursor-pointer font-semibold"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-700/60 bg-[#0f141e] text-left">
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-4 py-3.5">
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="font-clash text-xs uppercase tracking-wider text-slate-300 hover:text-[#ffc800] transition-colors focus-ring whitespace-nowrap flex items-center gap-1"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-[#ffc800]">{asc ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginated.length > 0 ? (
              paginated.map((m, i) => (
                <tr
                  key={m.tag}
                  className={`hover:bg-[#242f45]/50 transition-colors ${
                    i % 2 === 1 ? 'bg-[#0f141e]/30' : ''
                  }`}
                >
                  <td className="px-4 py-3.5 font-clash text-base text-slate-400">
                    {m.clanRank}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      to={`/player/${encodeURIComponent(m.tag.replace('#', ''))}`}
                      className="flex items-center gap-2.5 group focus-ring"
                    >
                      {m.townHallLevel && (
                        <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                          <ItemIcon
                            kind="townhall"
                            level={m.townHallLevel}
                            className="w-full h-full object-contain drop-shadow-sm"
                          />
                        </div>
                      )}
                      <span className="text-slate-100 group-hover:text-[#ffc800] transition-colors font-bold whitespace-nowrap">
                        {m.name}
                      </span>
                      <span className="text-slate-500 text-xs hidden md:inline font-mono">
                        {m.tag}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium whitespace-nowrap">
                    {roleLabel(m.role)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-semibold">
                    {m.expLevel}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {m.leagueTier?.iconUrls?.small || m.leagueTier?.iconUrls?.large ? (
                        <img
                          src={m.leagueTier.iconUrls.small || m.leagueTier.iconUrls.large}
                          alt=""
                          className="w-5 h-5 object-contain"
                        />
                      ) : null}
                      <span className="font-medium">{m.leagueTier?.name || 'Unranked'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#ffc800] font-clash text-base drop-shadow-sm">
                    {formatNumber(m.trophies)}
                  </td>
                  <td className="px-4 py-3.5 text-fuchsia-400 font-clash text-base drop-shadow-sm">
                    {formatNumber(m.builderBaseTrophies)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-semibold">
                    {formatNumber(m.donations)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-semibold">
                    {formatNumber(m.donationsReceived)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-8 text-center text-slate-400 font-medium"
                >
                  No members found matching "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-[#131a27] flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-semibold text-slate-400">
        <div>
          Showing{' '}
          <span className="text-slate-200">
            {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="text-slate-200">
            {Math.min(currentPage * pageSize, filtered.length)}
          </span>{' '}
          of <span className="text-slate-200">{filtered.length}</span> members
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-[#0f141e] border border-slate-700/60 text-slate-300 hover:bg-[#242f45] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider"
          >
            Prev
          </button>
          <span className="px-2 font-mono text-slate-200">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 rounded-lg bg-[#0f141e] border border-slate-700/60 text-slate-300 hover:bg-[#242f45] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}