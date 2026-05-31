import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategorySlider } from '../components/sports/CategorySlider';
import { MatchCard } from '../components/match/MatchCard';
import axiosInstance from '../api/axiosInstance';

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real scenario, you'd have these endpoints in your backend
        // const catRes = await axiosInstance.get('/sports');
        // const matchRes = await axiosInstance.get(`/matches?sport=${activeCategory}`);
        
        // Mock data for UI testing until backend routes are fully populated
        setCategories([
          { slug: 'all', name: 'All', liveMatchCount: 14 },
          { slug: 'cricket', name: 'Cricket', liveMatchCount: 7 },
          { slug: 'football', name: 'Football', liveMatchCount: 4 },
        ]);

        setMatches([
          {
            _id: '123',
            title: 'Indian Premier League',
            status: 'live',
            teamA: { name: 'RCB', logoUrl: '' },
            teamB: { name: 'GT', logoUrl: '' },
            cricketData: { statusText: 'RCB needs 45 runs in 24 balls' }
          }
        ]);
      } catch (error) {
        console.error("Failed to load homepage data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeCategory]);

  const handleMatchClick = (matchId) => {
    navigate(`/watch/${matchId}`);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Filter Slider */}
      <CategorySlider 
        categories={categories} 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />

      {/* Main Content Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-100 mb-4 px-1 uppercase tracking-wide">
          {activeCategory === 'all' ? 'Featured Matches' : `${activeCategory} Matches`}
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <MatchCard 
                key={match._id} 
                match={match} 
                onClick={handleMatchClick} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};