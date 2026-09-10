import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { normalizeTag } from '../api/coc.js'

export default function SearchBar({ size = 'hero', initialMode = 'clan' }) {
  const [mode, setMode] = useState(initialMode)
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  function submit(e) {
    e.preventDefault()
    const tag = normalizeTag(value)
    if (!tag) return
    navigate(`/${mode}/${encodeURIComponent(tag)}`)
    if (size === 'hero') setValue('')
  }

  const isHero = size === 'hero'

  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex ${isHero ? 'flex-col sm:flex-row gap-3' : 'gap-2'}`}>
        {/* Toggle Mode Segment */}
        <div className="flex bg-[#0f141e] p-1 border border-slate-700/70 rounded-xl shrink-0 shadow-inner">
          {['clan', 'player'].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 ${
                isHero ? 'py-2.5 text-xs' : 'py-1.5 text-[11px]'
              } font-clash font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === m
                  ? 'bg-[#ffc800] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search Input & Submit Button */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                mode === 'clan'
                  ? 'Clan tag, e.g. #2PP'
                  : 'Player tag, e.g. #2PP0LYQ'
              }
              aria-label={`${mode} tag`}
              className={`w-full bg-[#0f141e] border border-slate-700/70 text-slate-100 placeholder:text-slate-500 rounded-xl font-medium focus:outline-none focus:border-[#2a77f4] transition-colors shadow-inner ${
                isHero ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
              }`}
            />
          </div>

          <button
            type="submit"
            className={`font-clash bg-[#2a77f4] hover:bg-[#3d85f5] text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_0_#1a56b8] hover:shadow-[0_2px_0_#1a56b8] hover:translate-y-[2px] transition-all shrink-0 ${
              isHero ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'
            }`}
          >
            Search
          </button>
        </div>
      </div>
    </form>
  )
}