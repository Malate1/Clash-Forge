import SearchBar from '../components/SearchBar.jsx'

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-1 sm:px-6 pt-12 sm:pt-20 pb-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-[#182030] px-3 py-1.5 mb-5 shadow-md">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffc800] shadow-[0_0_12px_rgba(255,200,0,0.65)]" />
        <p className="font-clash text-[#ffc800] text-xs sm:text-sm uppercase tracking-[0.18em]">
          No account needed
        </p>
      </div>

      <h1 className="font-clash text-5xl sm:text-7xl font-normal text-white uppercase tracking-wider leading-[1.03] mb-6">
        Clash data,
        <br />
        without the clutter
      </h1>

      <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-9 leading-relaxed font-medium">
        Search any clan or player and get the stats that matter — roster activity, wars,
        trophies, troops, achievements, and more.
      </p>

      <div className="max-w-2xl mx-auto rounded-[1.4rem] border border-slate-700/50 bg-[#182030] p-3 sm:p-4 shadow-xl">
        <SearchBar size="hero" />
      </div>

      <div className="mt-16 grid sm:grid-cols-2 gap-4 text-left">
        <div className="group bg-[#182030] border border-slate-700/50 rounded-2xl p-6 shadow-md hover:border-slate-500/80 hover:-translate-y-1 transition-all duration-200">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f141e] border border-slate-700/50 text-[#ffc800] font-clash text-lg">
            C
          </div>
          <p className="font-clash text-2xl text-white uppercase tracking-wider mb-2">
            Clan intelligence
          </p>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Review members, donations, points, war league, clan capital, requirements, and win streaks in one view.
          </p>
        </div>

        <div className="group bg-[#182030] border border-slate-700/50 rounded-2xl p-6 shadow-md hover:border-slate-500/80 hover:-translate-y-1 transition-all duration-200">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f141e] border border-slate-700/50 text-[#ffc800] font-clash text-lg">
            P
          </div>
          <p className="font-clash text-2xl text-white uppercase tracking-wider mb-2">
            Player profile
          </p>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Check town hall, trophies, heroes, troop levels, war stars, achievements, and upgrade progress at a glance.
          </p>
        </div>
      </div>
    </div>
  )
}
