import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import headerLogo from '/assets/cf_header.png'

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <header className="site-header sticky top-0 z-30 border-b">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-3 rounded-xl focus-ring">
          <img
            src={headerLogo}
            alt="Clash Forge"
            className="h-9 w-auto shrink-0 object-contain transition-transform group-hover:scale-[1.03] sm:h-10"
          />
          <div className="hidden min-w-0 sm:block">
            <p className="font-clash text-sm uppercase tracking-[0.12em] text-white">Clash Forge</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Clan & player intelligence
            </p>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/"
            className="hidden rounded-full border border-slate-700/50 bg-[#182030] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-slate-500/80 hover:text-white sm:inline-flex"
          >
            Search
          </Link>
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="theme-toggle focus-ring"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            <span className="theme-toggle-icon" aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
            <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
