import React from 'react';

export const MatchCard = ({ match, onClick }) => {
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';

  return (
    <div 
      onClick={() => onClick(match._id)}
      className="bg-[#161925] border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group shadow-md"
    >
      {/* Upper Status Row */}
      <div className="flex items-center justify-between w-full border-b border-gray-800/50 pb-2">
        <span className="text-xs text-gray-500 font-medium tracking-wide truncate max-w-[70%]">
          {match.title}
        </span>
        {isLive ? (
          <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse-glow flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
            LIVE
          </span>
        ) : isUpcoming ? (
          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="bg-gray-800 text-gray-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            FINISHED
          </span>
        )}
      </div>

      {/* Main Core Teams & Scores Panel */}
      <div className="flex items-center justify-between my-2">
        {/* Team A Grid */}
        <div className="flex items-center gap-3 w-[40%]">
          <img src={match.teamA.logoUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-contain rounded-full bg-gray-800 p-1 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-sm text-gray-200 truncate">{match.teamA.name}</span>
        </div>

        {/* Dynamic Mid Score Counter */}
        <div className="flex flex-col items-center justify-center w-[20%]">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-gray-900/40 px-3 py-1.5 rounded-xl border border-gray-800">
              {match.footballData ? (
                <>
                  <span className="font-black text-lg text-teal-400">{match.footballData.scoreA}</span>
                  <span className="text-gray-600 font-bold text-xs">:</span>
                  <span className="font-black text-lg text-teal-400">{match.footballData.scoreB}</span>
                </>
              ) : (
                <span className="text-xs font-black text-teal-400 text-center">VS</span>
              )}
            </div>
          ) : (
            <span className="text-xs font-black text-gray-600">VS</span>
          )}
          {isLive && match.footballData && (
            <span className="text-[11px] text-teal-400 font-bold mt-1">{match.footballData.minute}'</span>
          )}
        </div>

        {/* Team B Grid */}
        <div className="flex items-center justify-end gap-3 w-[40%] text-right">
          <span className="font-bold text-sm text-gray-200 truncate">{match.teamB.name}</span>
          <img src={match.teamB.logoUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-contain rounded-full bg-gray-800 p-1 group-hover:scale-105 transition-transform" />
        </div>
      </div>

      {/* Bottom Cricket Context Summary String Row */}
      <div className="w-full text-center mt-1 pt-2 border-t border-gray-800/30">
        {match.cricketData?.statusText ? (
          <p className="text-xs text-teal-400 font-medium truncate">{match.cricketData.statusText}</p>
        ) : match.footballData ? (
          <p className="text-xs text-gray-500 truncate">Football Live Statistics Available</p>
        ) : (
          <p className="text-xs text-gray-500">Click to watch live video broadcast</p>
        )}
      </div>
    </div>
  );
};