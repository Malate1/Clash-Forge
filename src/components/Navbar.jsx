import { Link } from 'react-router-dom'
import SearchBar from './SearchBar.jsx'
import headerLogo from '/assets/cf_header.png'

export default function Navbar({ compactSearch = true }) {
  return (
    <header className="border-b-2 border-slate-700/60 bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-30 shadow-lg">
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
        
        {/* {compactSearch && (
          <div className="flex-1 max-w-md ml-auto">
            <SearchBar size="compact" />
          </div>
        )} */}
      </div>
    </header>
  )
}