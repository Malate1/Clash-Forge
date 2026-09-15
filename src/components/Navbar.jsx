import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar.jsx'
import headerLogo from '/assets/cf_header.png'

export default function Navbar({ compactSearch = true }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <header className="site-header border-b-2 sticky top-0 z-30 shadow-lg backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0 group focus-ring rounded-lg">
          <img
            src={headerLogo}
            alt="Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-body text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
            finds any clan or player
          </span>
        </Link>
        
        <div className="ml-auto flex items-center">
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