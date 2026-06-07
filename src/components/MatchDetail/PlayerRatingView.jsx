import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const PlayerRatingView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the URL passed from the clicked player card
  const rawUrl = location.state?.url;

  // Fallback if someone goes to this route directly
  if (!rawUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111] text-white">
        <h2>Rating details not found.</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-[#1db954] rounded font-bold text-[#111]">
          Go Back
        </button>
      </div>
    );
  }

  // Ensure the URL is HTTPS to prevent Mixed Content errors
  const secureUrl = rawUrl.replace('http://', 'https://');

  return (
    <div className="w-full h-screen flex flex-col bg-[#111] animate-fade-in">
      
      {/* 🟢 TOP GREEN NAVBAR WITH BACK BUTTON */}
      <div className="w-full bg-[#1db954] px-4 py-3 flex items-center shadow-md z-10 relative">
        <button 
          onClick={() => navigate(-1)} 
          className="text-white font-bold text-lg hover:opacity-80 flex items-center gap-2"
        >
          <span>←</span> Back to Match
        </button>
      </div>

      {/* 📄 IFRAME RENDERER */}
      <div className="w-full flex-1 bg-white overflow-hidden">
        <iframe 
          src={secureUrl}
          className="w-full h-full border-none"
          title="Player Rating Detail"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

    </div>
  );
};