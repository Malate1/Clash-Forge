import SearchBar from '../components/SearchBar.jsx'

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
      
      {/* Now using font-clash */}
      <p className="font-clash text-[#ffc800] text-lg uppercase tracking-widest mb-4 drop-shadow-sm">
        No account needed
      </p>
      
      {/* Now using font-clash */}
      <h1 className="font-clash text-5xl sm:text-7xl font-normal text-white uppercase tracking-wider leading-[1.15] mb-6 drop-shadow-lg">
        Look up any clan
        <br />
        or player, instantly
      </h1>
      
      <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Paste a clan tag to see its roster, war record and points, or a player tag to see
        troop levels, trophies and achievements. Straight from the Clash of Clans API.
      </p>

      <div className="max-w-xl mx-auto drop-shadow-2xl">
        <SearchBar size="hero" />
      </div>

      <div className="mt-20 grid sm:grid-cols-2 gap-6 text-left">
        <div className="bg-[#182030] border-2 border-slate-700/50 rounded-2xl p-6 shadow-lg hover:border-slate-500/80 hover:-translate-y-1 transition-all duration-200">
          {/* Now using font-clash */}
          <p className="font-clash text-2xl text-[#ffc800] uppercase tracking-wider mb-2 drop-shadow-sm">
            Clan lookup
          </p>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Members sorted by trophies or donations, war league, clan points and win streak.
          </p>
        </div>
        
        <div className="bg-[#182030] border-2 border-slate-700/50 rounded-2xl p-6 shadow-lg hover:border-slate-500/80 hover:-translate-y-1 transition-all duration-200">
          {/* Now using font-clash */}
          <p className="font-clash text-2xl text-[#ffc800] uppercase tracking-wider mb-2 drop-shadow-sm">
            Player lookup
          </p>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Town hall, hero and troop levels, war stars, and top achievement progress.
          </p>
        </div>
      </div>
    </div>
  )
}