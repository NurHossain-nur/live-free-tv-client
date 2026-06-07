import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { MatchScoreTab } from './MatchScoreTab';

export const MatchDetail = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the match data we passed from the dashboard
  const match = location.state?.matchData;
  
  // Tab State
  const tabs = ['Score', 'Overview', 'Analysis', 'Odds'];
  const [activeTab, setActiveTab] = useState('Overview');

  // Fallback if someone visits the URL directly without clicking a match
  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-[#161925]">
        <h2>Match details not found.</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-green-600 rounded">Go Back</button>
      </div>
    );
  }

  // Format Date (e.g., "06-06 7:00 PM")
  const formatBannerDate = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    const shortDate = dateStr.slice(5); // Turns "2026-06-06" into "06-06"
    
    // Convert 24h to 12h
    const [hourString, minute] = timeStr.split(':');
    let hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${shortDate} ${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="w-full min-h-screen bg-[#111] flex flex-col font-sans">
      
      {/* 🟢 TOP GREEN NAVBAR */}
      <div className="w-full bg-[#1db954] px-4 py-3 flex items-center gap-4 shadow-md">
        <button onClick={() => navigate(-1)} className="text-white font-bold text-lg hover:opacity-80">
          ← Match
        </button>
        <span className="text-white/80 font-medium">| Main</span>
      </div>

      {/* 🏟️ MATCH BANNER (Dark background with stadium vibe) */}
      <div 
        className="w-full relative py-8 px-4 flex flex-col items-center justify-center bg-[#1a1f2e] border-b border-gray-800"
        style={{
          // Optional: Add a subtle stadium background image here if you have one
          backgroundImage: 'radial-gradient(circle at center, #2a334a 0%, #161925 100%)'
        }}
      >
        <div className="text-gray-300 font-semibold mb-4 text-sm tracking-widest uppercase">
          {match.competition_name || 'Friendly'}
        </div>

        <div className="flex w-full max-w-2xl items-center justify-between">
          
          {/* Team A */}
          <div className="flex flex-col items-center gap-3 w-1/3">
            <img src={match.team_A_logo} alt={match.team_A_name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
            <span className="text-white font-bold text-sm sm:text-lg text-center">{match.team_A_name}</span>
          </div>

          {/* Score & Time Center */}
          <div className="flex flex-col items-center w-1/3">
            {match.status === 'Played' || match.status === 'Playing' ? (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded px-4 py-2 border border-white/5">
                  <span className="text-3xl sm:text-5xl font-bold text-white">{match.fs_A !== "" ? match.fs_A : '0'}</span>
                </div>
                <span className="text-white text-2xl font-bold">-</span>
                <div className="bg-white/10 backdrop-blur-sm rounded px-4 py-2 border border-white/5">
                  <span className="text-3xl sm:text-5xl font-bold text-white">{match.fs_B !== "" ? match.fs_B : '0'}</span>
                </div>
              </div>
            ) : (
              <div className="text-4xl font-bold text-white mb-2">VS</div>
            )}
            
            <div className="mt-4 text-gray-400 text-sm font-medium">
              {match.status === 'Cancelled' ? 'Cancelled' : formatBannerDate(match.date_utc, match.time_utc)}
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-3 w-1/3">
            <img src={match.team_B_logo} alt={match.team_B_name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
            <span className="text-white font-bold text-sm sm:text-lg text-center">{match.team_B_name}</span>
          </div>
          
        </div>
      </div>

      {/* 📑 TABS NAVIGATION */}
      <div className="w-full bg-[#1e2330] flex items-center justify-around sm:justify-center sm:gap-12 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-2 text-sm sm:text-base font-semibold transition-all duration-200 border-b-4 ${
              activeTab === tab 
                ? 'border-[#1db954] text-[#1db954]' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 📄 TAB CONTENT AREA */}
      <div className="w-full flex-1 bg-white">
        
        {activeTab === 'Overview' && (
          match.matchSK?.url ? (
            <iframe 
              src={match.matchSK.url}
              className="w-full h-[800px] border-none bg-white"
              title="Match Overview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="p-8 text-center text-gray-500 font-medium">Overview data not available for this match.</div>
          )
        )}

        {activeTab === 'Score' && (
           <MatchScoreTab matchId={matchId} />
        )}

        {activeTab === 'Analysis' && (
          match.matchAnalysis?.url ? (
             <iframe 
               src={match.matchAnalysis.url}
               className="w-full h-[800px] border-none bg-white"
               title="Match Analysis"
               sandbox="allow-scripts allow-same-origin"
             />
          ) : (
            <div className="p-8 text-center text-gray-500 font-medium">Analysis data not available for this match.</div>
          )
        )}

        {activeTab === 'Odds' && (
          match.matchOdds?.url ? (
             <iframe 
               src={match.matchOdds.url}
               className="w-full h-[800px] border-none bg-white"
               title="Match Odds"
               sandbox="allow-scripts allow-same-origin"
             />
          ) : (
            <div className="p-8 text-center text-gray-500 font-medium">Odds data not available for this match.</div>
          )
        )}
        
      </div>

    </div>
  );
};