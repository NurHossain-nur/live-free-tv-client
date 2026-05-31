import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useHLSPlayer } from '../hooks/useHLSPlayer';
import { ServerSwitcher } from '../components/player/ServerSwitcher';
import { Spinner } from '../components/common/Spinner';

export const WatchPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matchTitle, setMatchTitle] = useState('');
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/streams/${matchId}`);
        setMatchTitle(response.matchTitle || 'Live Event Stream');
        setServers(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedServer(response.data[0]); // Default to server index 0
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [matchId]);

  // Hook handles stream attachment lifecycle loops smoothly
  const { videoRef, isError } = useHLSPlayer(selectedServer?.streamUrl);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      {/* Back to Home Header */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-teal-400 transition-colors mb-4 self-start"
      >
        ← BACK TO LIVESTREAM FIXTURES
      </button>

      {/* Media Aspect Framework Stage Container */}
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-900 relative">
        {isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-gray-950">
            <p className="text-sm font-bold text-gray-300 mb-2">This channel configuration is currently unavailable</p>
            <p className="text-xs text-gray-500">Please try selecting an alternative broadcast link option below.</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
            autoPlay
            muted
          />
        )}
      </div>

      <h1 className="text-lg md:text-xl font-black text-gray-100 tracking-wide mt-4 px-1">
        {matchTitle}
      </h1>

      {/* Switcher Component Injection */}
      <ServerSwitcher 
        servers={servers} 
        activeServerId={selectedServer?._id} 
        onSelectServer={(server) => setSelectedServer(server)} 
      />
    </div>
  );
};