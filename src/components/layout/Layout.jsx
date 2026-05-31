import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const TopNav = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#161925]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
      {/* Brand Logo Section */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-transparent bg-clip-text font-black text-2xl tracking-wider">
            FREE LIVE TV
          </div>
          <span className="bg-teal-500/10 text-teal-400 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-500/20">
            PRO
          </span>
        </Link>

        {/* Navigation Tabs (Seamless Navigation) */}
        <nav className="hidden sm:flex items-center gap-1 ml-4 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
          <Link
            to="/"
            className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
              location.pathname === '/'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔥 Matches
          </Link>
          <Link
            to="/live-tv"
            className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
              location.pathname === '/live-tv'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📺 Live TV
          </Link>
        </nav>
      </div>

      {/* Right Actions & Mobile Direct Access Button */}
      <div className="flex items-center gap-3">
        {/* Mobile Navigation Tab Fallback (shows only on tiny mobile screens) */}
        <Link
          to={location.pathname === '/live-tv' ? '/' : '/live-tv'}
          className="sm:hidden flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1.5 text-xs font-bold rounded-lg"
        >
          {location.pathname === '/live-tv' ? '⚽ Go Matches' : '📺 Go Live TV'}
        </Link>

        <button className="text-gray-400 hover:text-white transition-colors p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0f111a] flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
};