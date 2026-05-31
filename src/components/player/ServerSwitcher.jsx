import React from 'react';

export const ServerSwitcher = ({ servers, activeServerId, onSelectServer }) => {
  if (!servers || servers.length === 0) return null;

  return (
    <div className="w-full bg-[#161925] border border-gray-800 rounded-2xl p-4 mt-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Available Streaming Channels
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {servers.map((server) => {
          const isSelected = activeServerId === server._id;
          return (
            <button
              key={server._id}
              onClick={() => onSelectServer(server)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase border ${
                isSelected
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-md shadow-teal-500/10'
                  : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></span>
                {server.serverName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};