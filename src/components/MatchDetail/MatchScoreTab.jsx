import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MatchScoreTab = ({ matchId }) => {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState(1); // Default to tab_id 1

  const navigate = useNavigate();

  const secureUrl = (url) => {
    if (!url) return '';
    return url.replace('http://', 'https://');
  };

  useEffect(() => {
    const fetchScoreData = async () => {
      try {
        setLoading(true);
        const targetUrl = `https://n.allfootballapp.com/api/newarticle/app/playerscore/getlist?match_id=${matchId.slice(1)}&tab_id=${activeSubTab}&sport_type=soccer`;
        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        
        // Using your proxy to avoid CORS
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(targetUrl)}`);
        const json = await res.json();
        
        if (json.code === 0) {
          setScoreData(json.data);
        }
      } catch (err) {
        console.error('Failed to load player scores:', err);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchScoreData();
    }
  }, [matchId, activeSubTab]);

  // Helper to determine score color based on rating value
  const getScoreColor = (scoreStr) => {
    const score = parseFloat(scoreStr);
    if (score >= 9.0) return 'text-[#f63d3d]'; // Red/Orange
    if (score >= 7.0) return 'text-[#f5a623]'; // Yellow/Orange
    if (score >= 6.0) return 'text-white';
    return 'text-gray-400';
  };

  // Helper to render event icons (goals, assists, cards)
  const renderEvents = (eventList, eventPics) => {
    if (!eventList || !eventPics) return null;
    const eventsToRender = [];

    // Push an image tag for every count of an event
    if (eventList.goals > 0) {
      for (let i = 0; i < eventList.goals; i++) {
        eventsToRender.push(<img key={`goal-${i}`} src={eventPics.goals} alt="Goal" className="w-3.5 h-3.5" />);
      }
    }
    if (eventList.assists > 0) {
      for (let i = 0; i < eventList.assists; i++) {
        eventsToRender.push(<img key={`assist-${i}`} src={eventPics.assists} alt="Assist" className="w-3.5 h-3.5" />);
      }
    }
    if (eventList.yellow_cards > 0) {
      for (let i = 0; i < eventList.yellow_cards; i++) {
        eventsToRender.push(<img key={`yc-${i}`} src={eventPics.yellow_cards} alt="Yellow Card" className="w-3.5 h-3.5" />);
      }
    }
    if (eventList.red_cards > 0) {
      for (let i = 0; i < eventList.red_cards; i++) {
        eventsToRender.push(<img key={`rc-${i}`} src={eventPics.red_cards} alt="Red Card" className="w-3.5 h-3.5" />);
      }
    }

    return (
      <div className="flex items-center gap-1 mt-1.5">
        {eventsToRender}
      </div>
    );
  };

  if (loading && !scoreData) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#111]">
        <div className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!scoreData || !scoreData.list || scoreData.list.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-[#111]">No rating data available yet.</div>;
  }

  return (
    <div className="w-full flex flex-col bg-[#111] min-h-screen">
      
      {/* 🔴 SUB-NAVIGATION TABS (Team A, Team B, X Factors) */}
      <div className="w-full bg-[#161925] border-b border-gray-800 p-2">
        <div className="flex items-center rounded-lg bg-[#0a0c13] overflow-hidden border border-gray-800">
          {scoreData.tab_list.map((tab) => (
            <button
              key={tab.tab_id}
              onClick={() => setActiveSubTab(tab.tab_id)}
              className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold transition-colors ${
                activeSubTab === tab.tab_id 
                  ? 'bg-[#1e2330] text-[#1db954]' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#161925]'
              }`}
            >
              {tab.tab_pic && <img src={secureUrl(tab.tab_pic)} alt={tab.tab_name} className="w-4 h-4 object-contain" />}
              {tab.tab_name}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 PLAYER CARDS LIST */}
      <div className="flex flex-col gap-2 p-2">
        {scoreData.list.map((player) => (
          <div 
            key={player.id} 
            onClick={() => navigate(`/player-rating`, { state: { url: player.share_data.url } })}
            className="flex items-center justify-between bg-[#1a1f2e] p-3 rounded-lg border border-gray-800/60"
          >
            {/* Left Side: Avatar & Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                {/* Update Player Images */}
                <img 
                  src={secureUrl(player.player_pic)} 
                  alt={player.player_name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/60/333/888?text=Player' }} 
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-gray-100 font-bold text-base">{player.player_name}</span>
                <span className="text-gray-500 text-xs font-medium mt-0.5">{player.desc}</span>
                {/* Dynamically render goals/assists/cards */}
                {renderEvents(player.event_list, scoreData.event_pic)}
              </div>
            </div>

            {/* Right Side: Score & Stars */}
            <div className="flex flex-col items-end justify-center min-w-[80px]">
              {/* Empty Stars Display */}
              <div className="text-gray-500 text-xs tracking-widest mb-0.5">
                ☆☆☆☆☆
              </div>
              <span className={`text-2xl font-black ${getScoreColor(player.allscore)}`}>
                {player.allscore}
              </span>
              <span className="text-gray-600 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                {player.vote_num_desc}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};