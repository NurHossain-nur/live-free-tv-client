import React, { useState, useEffect, useRef } from 'react';
import { StatsTable } from './StatsTable';
import { StatsRanking } from './StatsRanking';
import { StatsFixtures } from './StatsFixtures';

export const StatsDashboard = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Create a ref to control the scroll container
  const scrollContainerRef = useRef(null);

  // 2. Fetch main stats menu (Leagues)
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        const targetUrl = 'https://m.allfootballapp.com/m/app/global/2/m.json?menu=stats&plat=m';
        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(targetUrl)}`);
        const json = await res.json();
        
        if (json?.menus?.ranking) {
          const sortedLeagues = json.menus.ranking.sort((a, b) => a.position - b.position);
          setLeagues(sortedLeagues);
          
          if (sortedLeagues.length > 0) {
            setSelectedLeague(sortedLeagues[0]);
            if (sortedLeagues[0].sub_tabs?.length > 0) {
              setActiveSubTab(sortedLeagues[0].sub_tabs[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load stats menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  // 3. Handle League Selection & Auto-Centering
  const handleLeagueChange = (league, event) => {
    setSelectedLeague(league);
    if (league.sub_tabs?.length > 0) {
      setActiveSubTab(league.sub_tabs[0]);
    } else {
      setActiveSubTab(null);
    }

    // 🔥 THE MAGIC: Calculate center and smooth scroll
    if (scrollContainerRef.current && event?.currentTarget) {
      const container = scrollContainerRef.current;
      const button = event.currentTarget;
      
      // Math to find the exact middle of the screen
      const scrollPosition = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full flex flex-col bg-[#111] min-h-screen font-sans animate-fade-in relative">
      
      {/* 📌 STICKY HEADER WRAPPER */}
      <div className="sticky top-0 z-50 w-full shadow-xl bg-[#111]">
        
        {/* 🟢 TOP LEAGUES SCROLLBAR */}
        <div className="w-full bg-white border-b border-gray-200">
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          
          {/* Attach the ref here so React can control the scrolling */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar scroll-smooth touch-pan-x w-full"
          >
            {leagues.map((league) => (
              <button
                key={league.id}
                // Pass the event (e) to the handler so we know which button was clicked
                onClick={(e) => handleLeagueChange(league, e)}
                className={`shrink-0 whitespace-nowrap px-5 py-3 text-[15px] font-semibold transition-all border-b-4 ${
                  selectedLeague?.id === league.id
                    ? 'border-[#1db954] text-[#1db954]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {league.label}
              </button>
            ))}
          </div>
        </div>

        {/* 🔘 SUB-TABS (Table, Goals, Assists, Fixtures) */}
        {selectedLeague && selectedLeague.sub_tabs?.length > 0 && (
          <div className="w-full bg-[#1e232b] p-3 border-b border-black">
            <div className="flex w-full rounded overflow-hidden bg-[#2b323a] border border-[#343c45]">
              {selectedLeague.sub_tabs.map((tab) => (
                <button
                  key={tab.title}
                  onClick={() => setActiveSubTab(tab)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold transition-colors ${
                    activeSubTab?.title === tab.title
                      ? 'bg-[#1a1f24] text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#22282f]'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 📄 DYNAMIC CONTENT AREA */}
      <div className="w-full p-3">
        <div className="w-full rounded-lg overflow-hidden shadow-lg border border-[#343c45]">
          {activeSubTab?.title === 'Table' && <StatsTable key={activeSubTab.url} url={activeSubTab.url} />}
          {activeSubTab?.title === 'Goals' && <StatsRanking key={activeSubTab.url} url={activeSubTab.url} type="Goals" />}
          {activeSubTab?.title === 'Assists' && <StatsRanking key={activeSubTab.url} url={activeSubTab.url} type="Assists" />}
          {activeSubTab?.title === 'Fixtures' && <StatsFixtures key={activeSubTab.url} url={activeSubTab.url} />}
          
          {!activeSubTab && (
            <div className="p-8 text-center text-gray-500 bg-[#2b323a]">No stats available for this league.</div>
          )}
        </div>
      </div>

    </div>
  );
};