import React, { useState, useEffect } from 'react';

export const StatsTable = ({ url }) => {
  const [roundsData, setRoundsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const secureUrl = (link) => (link ? link.replace('http://', 'https://') : '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${backendUrl}/api/v1/proxy/football?url=${encodeURIComponent(url)}`);
        const json = await res.json();

        if (json?.content?.rounds) {
          setRoundsData(json.content.rounds);
        }
      } catch (err) {
        console.error('Failed to fetch table data', err);
      } finally {
        setLoading(false);
      }
    };
    if (url) fetchData();
  }, [url]);

  const formatLocalTime = (dateUtc, timeUtc) => {
    if (!dateUtc || !timeUtc) return '';
    try {
      const date = new Date(`${dateUtc}T${timeUtc}Z`);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return `${dateUtc.slice(5)} ${timeUtc.slice(0, 5)}`;
    }
  };

  // 🏈 REUSABLE KNOCKOUT ROW COMPONENT
  const MatchRow = ({ match, isTotal = false }) => {
    if (!match) return null;
    
    return (
      <div className={`flex items-center justify-between p-3 border-b border-gray-700 hover:bg-[#343c45] transition-colors ${isTotal ? 'bg-[#303640]' : 'bg-[#2b323a]'}`}>
        <div className={`text-sm w-1/4 pl-2 ${isTotal ? 'text-gray-500 font-bold' : 'text-gray-400'}`}>
          {isTotal ? 'Total' : formatLocalTime(match.date_utc, match.time_utc)}
        </div>
        <div className="flex items-center justify-center gap-3 w-2/4 min-w-[250px]">
          <div className="flex items-center justify-end gap-3 w-[40%]">
            <span className="font-bold text-gray-200 text-right">{match.team_A_name}</span>
            <img src={secureUrl(match.team_A_logo)} alt="Home" className="w-5 h-5 object-contain shrink-0" />
          </div>
          <div className="font-bold text-sm w-[20%] text-center whitespace-nowrap text-gray-100">
            {match.fs_A !== "" && match.fs_A !== undefined ? `${match.fs_A} : ${match.fs_B}` : 'VS'}
          </div>
          <div className="flex items-center justify-start gap-3 w-[40%]">
            <img src={secureUrl(match.team_B_logo)} alt="Away" className="w-5 h-5 object-contain shrink-0" />
            <span className="font-bold text-gray-200 text-left">{match.team_B_name}</span>
          </div>
        </div>
        <div className="w-1/4"></div>
      </div>
    );
  };

  // 📊 REUSABLE TABLE RENDERER (Used for both standard leagues and grouped stages)
  const renderPointsTable = (teamsArray, topLimit = 1) => (
    <table className="w-full text-left min-w-[600px] mb-2 border-b border-gray-700">
      <thead className="bg-[#2b323a] text-gray-400 font-semibold border-b border-gray-700">
        <tr>
          <th className="p-3 pl-4">Team</th>
          <th className="p-3 w-10 text-center">P</th>
          <th className="p-3 w-10 text-center">W</th>
          <th className="p-3 w-10 text-center">D</th>
          <th className="p-3 w-10 text-center">L</th>
          <th className="p-3 w-16 text-center">F/A</th>
          <th className="p-3 w-12 text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {teamsArray.map((team, index) => {
          // Highlight rows based on the 'top' variable passed by the API (e.g., top 1 or top 2 advance)
          const isHighlighted = index < topLimit;
          return (
            <tr key={team.team_id || index} className={`border-b border-gray-700 transition-colors ${isHighlighted ? 'bg-[#1db954] text-white' : 'hover:bg-[#343c45]'}`}>
              <td className="p-3 pl-4 flex items-center gap-3">
                <span className={`w-5 text-center font-bold ${isHighlighted ? 'text-white' : 'text-gray-400'}`}>{team.rank}</span>
                <img src={secureUrl(team.team_logo)} alt={team.team_name} className="w-6 h-6 object-contain" />
                <span className="font-bold">{team.team_name}</span>
              </td>
              <td className="p-3 text-center">{team.matches_total}</td>
              <td className="p-3 text-center">{team.matches_won}</td>
              <td className="p-3 text-center">{team.matches_draw}</td>
              <td className="p-3 text-center">{team.matches_lost}</td>
              <td className="p-3 text-center">{team.goals_pro}/{team.goals_against}</td>
              <td className="p-3 text-center font-bold">{team.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="w-full bg-[#2b323a] text-gray-200 text-sm animate-fade-in overflow-x-auto">
      
      {roundsData.map((round, roundIndex) => {
        const roundDataArray = round?.content?.data || [];
        if (roundDataArray.length === 0) return null;

        // 🔍 DETECT DATA TYPE
        const isStandardTable = roundDataArray[0].points !== undefined;
        const isGroupedTable = roundDataArray[0].data !== undefined && Array.isArray(roundDataArray[0].data);
        const isAggregateMatch = round.template === 'team_point_ranking_aggregate';
        const isSingleMatch = round.template === 'team_point_ranking_match';

        return (
          <div key={roundIndex} className="w-full">
            
            {/* 🏷️ MAIN SECTION HEADER ("Group Stage", "Final", etc.) */}
            {round.content?.name && (
              <div className="bg-[#1e232b] px-4 py-3 text-white text-[13px] font-bold border-b border-gray-800">
                {round.content.name}
              </div>
            )}

            {/* 📊 1A. RENDER STANDARD POINTS TABLE (e.g., EPL) */}
            {isStandardTable && renderPointsTable(roundDataArray, round.content?.top || 1)}

            {/* 🗂️ 1B. RENDER GROUPED POINTS TABLE (e.g., Copa Libertadores) */}
            {isGroupedTable && (
              <div className="flex flex-col w-full">
                {roundDataArray.map((group, gIdx) => (
                  <div key={gIdx}>
                    {/* Sub-header for the specific group (e.g., "Group A") */}
                    {group.name && (
                      <div className="bg-[#22282f] px-4 py-2 text-gray-300 font-bold border-y border-gray-700">
                        {group.name}
                      </div>
                    )}
                    {renderPointsTable(group.data, group.top || 1)}
                  </div>
                ))}
              </div>
            )}

            {/* ⚔️ 2. RENDER AGGREGATE KNOCKOUT FIXTURES */}
            {isAggregateMatch && (
              <div className="flex flex-col w-full min-w-[500px]">
                {roundDataArray.map((matchBlock, mIdx) => (
                  <React.Fragment key={mIdx}>
                    {matchBlock.match1 && <MatchRow match={matchBlock.match1} />}
                    {matchBlock.match2 && <MatchRow match={matchBlock.match2} />}
                    {matchBlock.total && <MatchRow match={matchBlock.total} isTotal={true} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* 🏆 3. RENDER SINGLE KNOCKOUT FIXTURES */}
            {isSingleMatch && (
              <div className="flex flex-col w-full min-w-[500px]">
                {roundDataArray.map((match, mIdx) => (
                  <MatchRow key={match.match_id || mIdx} match={match} />
                ))}
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
};