import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MatchTabDashboard = () => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // 1. Fetch Tab configurations on component mount
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        setLoadingTabs(true);
        const targetUrl = 'https://m.allfootballapp.com/m/app/global/2/m.json?menu=match&plat=m';
        const backendUrl = import.meta.env.VITE_API_BASE_URL; 
        
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(targetUrl)}`);
        const data = await res.json();
        if (data?.menus?.match_tab) {
          const sortedTabs = data.menus.match_tab.sort((a, b) => a.sort - b.sort);
          setTabs(sortedTabs);
          if (sortedTabs.length > 0) {
            setSelectedTab(sortedTabs[0]); // Default to 'Main'
          }
        }
      } catch (err) {
        console.error('Failed to load match configurations:', err);
      } finally {
        setLoadingTabs(false);
      }
    };
    fetchTabs();
  }, []);

  // 2. Re-fetch match lists whenever user clicks a separate league/tab
  useEffect(() => {
    if (!selectedTab) return;

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const backendUrl = import.meta.env.VITE_API_BASE_URL; 
        
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(selectedTab.api)}`);
        const data = await res.json();
        
        setMatches(data?.list || []);
      } catch (err) {
        console.error('Error fetching fixture data:', err);
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, [selectedTab]);

  // Helper utility: Groups items by date strings
  const groupMatchesByDate = (matchList) => {
    return matchList.reduce((groups, match) => {
      const date = match.date_utc || 'Scheduled';
      if (!groups[date]) groups[date] = [];
      groups[date].push(match);
      return groups;
    }, {});
  };

  const groupedData = groupMatchesByDate(matches);

  // Helper utility: Formats date string and adds Day of the Week (e.g. 2026-06-10 WED)
  const formatDateHeader = (dateStr) => {
    if (dateStr === 'Scheduled') return dateStr;
    
    // Get the Day name (MON, TUE, etc.)
    const dateObj = new Date(`${dateStr}T00:00:00`);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = days[dateObj.getDay()];

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return `${dateStr} ${dayName} (TODAY)`;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yestStr) return `${dateStr} ${dayName} (YESTERDAY)`;

    return `${dateStr} ${dayName}`;
  };

  // Helper utility: Converts 24h format (13:00:00) to 12h AM/PM format (01:00 PM)
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hourString, minute] = timeStr.split(':');
    let hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // '0' should be '12'
    const paddedHour = hour < 10 ? `0${hour}` : hour;
    return `${paddedHour}:${minute} ${ampm}`;
  };

  if (loadingTabs) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in">
      
      {/* ⚽ LEAGUE HORIZONTAL SCROLLBAR TABS */}
      <div className="w-full bg-[#161925] border border-gray-800 rounded-xl p-1 overflow-x-auto scrollbar-none shadow-md">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                selectedTab?.id === tab.id
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 MATCH LIST CONTROLLER VIEW */}
      <div className="w-full flex flex-col gap-6 mt-2">
        {loadingMatches ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="text-center text-gray-500 py-12 border border-gray-800 rounded-xl bg-gray-900/5">
            No live fixtures or results found for this selection.
          </div>
        ) : (
          Object.entries(groupedData).map(([date, dateMatches]) => (
            <div key={date} className="w-full flex flex-col">
              
              {/* 📅 SECTION DATE HEADER */}
              <div className="w-full bg-gray-900/40 border-y border-gray-800 px-4 py-2 text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 rounded-md text-center">
                {formatDateHeader(date)}
              </div>

              {/* FIXTURE CONTAINER TILES */}
              <div className="flex flex-col gap-2.5">
                {dateMatches.map((match) => (
                  <div
                    key={match.match_id}
                    onClick={() => navigate(`/details/${match.match_id}`, { state: { matchData: match } })}
                    className="w-full bg-[#161925] border border-gray-800 hover:border-gray-700 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-sm relative group"
                  >
                    {/* Left Team Column */}
                    <div className="w-[38%] flex flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:justify-end sm:text-right">
                      <span className="text-[13px] sm:text-sm font-bold text-gray-100 truncate group-hover:text-teal-400 transition-colors order-2 sm:order-1">
                        {match.team_A_name}
                      </span>
                      {match.team_A_logo ? (
                        <img src={match.team_A_logo} alt="Logo" className="w-8 h-8 object-contain order-1 sm:order-2" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400 order-1 sm:order-2">🛡️</div>
                      )}
                    </div>

                    {/* Center Score Status Node */}
                    <div className="w-[24%] flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                        {match.competition_name || 'Match'}
                      </span>
                      
                      {match.status === 'Played' || match.status === 'Playing' ? (
                        // ✅ MATCH IS LIVE OR FINISHED (Show Scores)
                        <>
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-black tracking-tighter ${match.status === 'Played' ? 'text-gray-300' : 'text-teal-400'}`}>
                              {match.fs_A !== "" ? match.fs_A : '0'}
                            </span>
                            <span className="text-gray-600 font-bold text-sm">-</span>
                            <span className={`text-xl font-black tracking-tighter ${match.status === 'Played' ? 'text-gray-300' : 'text-teal-400'}`}>
                              {match.fs_B !== "" ? match.fs_B : '0'}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                            match.status === 'Played' 
                              ? 'bg-gray-800/40 text-gray-500' 
                              : 'bg-emerald-500/10 text-emerald-400 animate-pulse'
                          }`}>
                            {match.status === 'Played' ? 'END' : `${match.minute}'`}
                          </span>
                        </>
                      ) : (
                        // ⏱️ MATCH IS UPCOMING OR CANCELLED (Show VS and Time)
                        <>
                          <span className="text-lg font-bold text-gray-300 mb-0.5">VS</span>
                          <span className={`text-[11px] font-semibold tracking-wide ${match.status === 'Cancelled' ? 'text-red-400' : 'text-gray-500'}`}>
                            {match.status === 'Cancelled' ? 'Cancelled' : formatTime(match.time_utc)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Right Team Column */}
                    <div className="w-[38%] flex flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:justify-start sm:text-left">
                      {match.team_B_logo ? (
                        <img src={match.team_B_logo} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">🛡️</div>
                      )}
                      <span className="text-[13px] sm:text-sm font-bold text-gray-100 truncate group-hover:text-teal-400 transition-colors">
                        {match.team_B_name}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};