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
      <div className={`flex ${isHero ? 'flex-col gap-3 sm:flex-row' : 'gap-2'}`}>
        <div className="flex shrink-0 rounded-xl border border-slate-700/50 bg-[#0f141e] p-1">
          {['clan', 'player'].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 font-clash uppercase tracking-wider transition-all ${
                isHero ? 'py-2.5 text-xs' : 'py-1.5 text-[11px]'
              } ${
                mode === m
                  ? 'bg-[#ffc800] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === 'clan' ? 'Clan tag, e.g. #2PP' : 'Player tag, e.g. #2PP0LYQ'}
            aria-label={`${mode} tag`}
            className={`min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-[#0f141e] font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none ${
              isHero ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
            }`}
          />

          <button
            type="submit"
            className={`shrink-0 rounded-xl bg-[#2a77f4] font-clash uppercase tracking-wider text-white shadow-[0_4px_0_#1a56b8] hover:bg-[#3d85f5] hover:shadow-[0_2px_0_#1a56b8] ${
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
