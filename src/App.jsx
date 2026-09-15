import { Routes, Route, Link } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ClanPage from './pages/ClanPage.jsx'
import PlayerPage from './pages/PlayerPage.jsx'
import WarsPage from './pages/WarsPage.jsx'

export default function App() {
  return (

    <div className="app min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clan/:tag" element={<ClanPage />} />
          <Route path="/clan/:tag/wars" element={<WarsPage />} />
          <Route path="/player/:tag" element={<PlayerPage />} />
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-wide uppercase mb-2 drop-shadow-lg">
                  Oops!
                </h2>
                <p className="text-lg md:text-xl text-slate-400 font-semibold mb-8">
                  Nothing to see here, Chief.
                </p>

                <Link 
                  to="/" 
                  className="bg-[#2a77f4] hover:bg-[#3d85f5] text-white font-bold py-3 px-8 rounded-xl shadow-[0_5px_0_#1a56b8] hover:shadow-[0_2px_0_#1a56b8] hover:translate-y-[3px] transition-all uppercase tracking-wider text-sm"
                >
                  Back to Village
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="bg-[#0a0d14] border-t border-slate-800/60 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
          <p className="font-clash text-xs uppercase tracking-[0.14em] text-slate-400">
            Clash Forge
          </p>
          <p className="text-slate-500 text-xs font-medium tracking-wide">
            Not affiliated with Supercell. Data via the Clash of Clans API.
          </p>
        </div>
      </footer>
      <Analytics />
    </div>
  )
}