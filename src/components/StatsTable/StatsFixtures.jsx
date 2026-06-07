import React, { useState, useEffect } from 'react';

export const StatsFixtures = ({ url }) => {
  const [fixtures, setFixtures] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  const secureUrl = (link) => (link ? link.replace('http://', 'https://') : '');

  // Helper to fetch data when a specific round is clicked
  const fetchRoundData = async (roundUrl, index) => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(roundUrl)}`);
      const json = await res.json();

      if (json?.content?.matches) {
        setFixtures(json.content.matches);
      }
      if (index !== undefined) {
        setCurrentIndex(index);
      }
    } catch (err) {
      console.error('Failed to fetch round fixtures', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(url)}`);
        const json = await res.json();

        // 1. Store all available rounds
        if (json?.content?.rounds) {
          setRounds(json.content.rounds);
          
          // 2. Find which round is currently active, default to 0 if none found
          let activeIndex = json.content.rounds.findIndex((r) => r.current);
          if (activeIndex === -1) activeIndex = 0;
          setCurrentIndex(activeIndex);
        }

        // 3. Set the initial match list
        if (json?.content?.matches) {
          setFixtures(json.content.matches);
        }
      } catch (err) {
        console.error('Failed to fetch initial fixtures', err);
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchInitialData();
  }, [url]);

  const formatDateTime = (dateStr, timeStr) => {
    const shortDate = dateStr.slice(5); // "05-24"
    const [hour, minute] = timeStr.split(':');
    return `${shortDate} ${hour}:${minute}`;
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      fetchRoundData(rounds[currentIndex - 1].url, currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < rounds.length - 1) {
      fetchRoundData(rounds[currentIndex + 1].url, currentIndex + 1);
    }
  };

  // Main full-page loading state for initial load
  if (loading && rounds.length === 0) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#2b323a] text-gray-200 text-sm animate-fade-in relative">
      
      {/* 🔄 Round Navigation Header */}
      <div className="bg-[#343c45] py-2 px-4 flex items-center justify-between border-b border-gray-700">
        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className={`text-xs font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
            currentIndex <= 0 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'text-gray-300 hover:bg-[#22282f] hover:text-white'
          }`}
        >
          <span>◀</span> Previous
        </button>

        <span className="text-center text-gray-300 font-bold">
          {rounds[currentIndex]?.name || 'Fixtures'}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex >= rounds.length - 1}
          className={`text-xs font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
            currentIndex >= rounds.length - 1 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'text-gray-300 hover:bg-[#22282f] hover:text-white'
          }`}
        >
          Next <span>▶</span>
        </button>
      </div>

      {/* ⏳ Loading Overlay (Shows when switching rounds) */}
      {loading && rounds.length > 0 && (
        <div className="absolute inset-0 top-12 bg-[#2b323a]/60 backdrop-blur-[1px] flex justify-center items-start pt-20 z-10">
          <div className="animate-spin w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* ⚽ Match List */}
      <div className="flex flex-col">
        {fixtures.map((match) => (
          <div
            key={match.match_id}
            className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-700 hover:bg-[#343c45] transition-colors"
          >
            {/* Time */}
            <div className="text-gray-400 text-xs sm:text-sm w-full sm:w-1/4 text-center sm:text-left mb-2 sm:mb-0">
              {formatDateTime(match.date_utc, match.time_utc)}
            </div>

            {/* Match Teams & Score */}
            <div className="flex items-center justify-center gap-4 w-full sm:w-2/4">
              <div className="flex items-center justify-end gap-2 w-2/5">
                <span className="font-bold text-gray-200 text-right">{match.team_A_name}</span>
                <img src={secureUrl(match.team_A_logo)} alt="Home" className="w-6 h-6 object-contain" />
              </div>

              <div className="font-bold text-lg text-[#1db954] w-1/5 text-center whitespace-nowrap">
                {match.status === 'Played' ? `${match.fs_A} : ${match.fs_B}` : 'VS'}
              </div>

              <div className="flex items-center justify-start gap-2 w-2/5">
                <img src={secureUrl(match.team_B_logo)} alt="Away" className="w-6 h-6 object-contain" />
                <span className="font-bold text-gray-200 text-left">{match.team_B_name}</span>
              </div>
            </div>

            <div className="w-full sm:w-1/4"></div> {/* Spacer for desktop alignment */}
          </div>
        ))}
        
        {fixtures.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">No matches scheduled for this round.</div>
        )}
      </div>
    </div>
  );
};