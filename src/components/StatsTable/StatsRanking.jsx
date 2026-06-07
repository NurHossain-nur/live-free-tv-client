import React, { useState, useEffect } from 'react';

export const StatsRanking = ({ url, type }) => {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const secureUrl = (link) => link ? link.replace('http://', 'https://') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        
        if (json?.content?.data) {
          setRankingData(json.content.data);
        }
      } catch (err) {
        console.error('Failed to fetch ranking data', err);
      } finally {
        setLoading(false);
      }
    };
    if (url) fetchData();
  }, [url]);

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="w-full bg-[#2b323a] text-gray-200 text-sm animate-fade-in overflow-x-auto">
      <table className="w-full text-left min-w-[500px]">
        <thead className="bg-[#22282f] text-gray-400 font-semibold border-b border-gray-700">
          <tr>
            <th className="p-3 pl-4 w-12 text-center">#</th>
            <th className="p-3">Player</th>
            <th className="p-3">Team</th>
            <th className="p-3">{type === 'Goals' ? 'Goals' : 'Assists'}</th>
          </tr>
        </thead>
        <tbody>
          {rankingData.map((player) => (
            <tr key={player.person_id} className="border-b border-gray-700 hover:bg-[#343c45] transition-colors">
              <td className="p-3 pl-4 text-center text-gray-400 font-bold">{player.rank}</td>
              <td className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 border border-gray-600">
                  <img src={secureUrl(player.person_logo)} alt={player.person_name} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                </div>
                <span className="font-bold text-gray-100">{player.person_name}</span>
              </td>
              <td className="p-3 text-gray-300">{player.team_name}</td>
              <td className="p-3 font-bold text-gray-100">{player.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};