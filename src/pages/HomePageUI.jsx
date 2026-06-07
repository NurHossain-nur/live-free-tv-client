import React, { useState } from 'react';

import { MatchTabDashboard } from '../components/sports/MatchTabDashboard';
import { StatsDashboard } from '../components/StatsTable/StatsDashboard';
import LiveStreamingPlayer from '../components/LiveStreamingPlayer';
import { FeaturedLiveTv } from '../components/FeaturedLiveTv/FeaturedLiveTv';
// 1. 👇 Import the newly created component
// import { FeaturedLiveTv } from '../components/FeaturedLiveTv'; 

export const HomePageUI = () => {
  // Main Top Navbar state matching your screenshot layout criteria
  const [activeTab, setActiveTab] = useState('LIVE');
  


  // Render sub-page contents conditionally based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIVE':
        return (
          <div className="w-full flex flex-col gap-6 animate-fade-in">


            {/* 2. 👇 Inject the Featured TV component here and pass the tab switch function! */}
            <FeaturedLiveTv  />

          </div>
        );

      case 'ALL TV':
        return <LiveStreamingPlayer />;

      case 'MATCH':
        return <MatchTabDashboard />;

      case 'STATS':
        return <StatsDashboard />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* 🟢 TOP TABS MENU BAR */}
      <div className="sticky top-[56px] sm:top-[64px] z-40 w-full bg-[#161925] border border-gray-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between grid grid-cols-4 text-center">
          {['LIVE', 'ALL TV', 'MATCH', 'STATS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[11px] sm:text-sm font-black tracking-wider transition-all relative border-b-2 ${
                activeTab === tab
                  ? 'text-teal-400 border-teal-500 bg-gray-900/30'
                  : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-900/10'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-teal-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Render Region */}
      <div className="w-full min-h-[50vh]">
        {renderTabContent()}
      </div>

    </div>
  );
};