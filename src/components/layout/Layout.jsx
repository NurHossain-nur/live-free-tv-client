import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const TopNav = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#161925]/95 backdrop-blur-md px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg">
      
      {/* ⬅️ LEFT SIDE: Brand Logo */}
      <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity shrink-0">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-transparent bg-clip-text font-black text-lg sm:text-2xl tracking-wider">
          FREE LIVE TV
        </div>
        <span className="bg-teal-500/10 text-teal-400 text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-500/20">
          PRO
        </span>
      </Link>

      {/* ➡️ RIGHT SIDE: Navigation Buttons */}
      <nav className="flex items-center gap-0.5 sm:gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800 shrink-0">
        
        <Link
          to="/"
          className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
            location.pathname === '/'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <span className="hidden sm:inline mr-1">🔥</span>Matches
        </Link>

        <Link
          to="/live-tv"
          className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
            location.pathname === '/live-tv'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <span className="hidden sm:inline mr-1">📺</span>Live TV
        </Link>

        <Link
          to="/stats"
          className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
            location.pathname === '/stats'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <span className="hidden sm:inline mr-1">📊</span>Stats
        </Link>

      </nav>

    </header>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0f111a] flex flex-col">
      <TopNav />
      {/* Note: I removed the max-w-5xl constraint so your tables can expand fully on large screens */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
};