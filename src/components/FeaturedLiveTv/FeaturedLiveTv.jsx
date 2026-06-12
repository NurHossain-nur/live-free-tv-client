import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { NativeAd } from '../add/NativeAd';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-render-backend.onrender.com';

// 🔥 THE ISOLATED API-POLLING VIEWER BADGE
const LiveViewerBadge = ({ channelId }) => {
  const [viewers, setViewers] = useState(1);
  
  // Create a unique, random ID for this specific viewer's browser tab
  const userIdRef = useRef(Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    if (!channelId) return;

    const userId = userIdRef.current; 

    // 1. Fetch the total active count
    const fetchViewerCount = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/streams/livecount/${channelId}`);
        const data = await response.json();
        setViewers(data.viewers || 1);
      } catch (error) {
        console.error("Failed to fetch viewer count", error);
      }
    };

    // 2. Send the pulse with the User ID
    const pingServer = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/v1/streams/livecount/${channelId}/pulse`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }) 
        });
      } catch (error) {
        // Silent fail
      }
    };

    // Run immediately on load
    fetchViewerCount();
    pingServer();

    // 🔥 FETCH TIMING: Grab the pre-calculated count every 15 seconds
    const countInterval = setInterval(fetchViewerCount, 15000); 

    // 🔥 PULSE TIMING (JITTER): Send the pulse at a RANDOM time between 25 and 40 seconds
    // This perfectly spreads out 5,000 users so Render never spikes!
    const randomDelay = Math.floor(Math.random() * 15000) + 25000;
    const pingInterval = setInterval(pingServer, randomDelay);

    return () => {
      clearInterval(countInterval);
      clearInterval(pingInterval);
    };
  }, [channelId]);

  return (
    <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg shadow-inner">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-teal-400 animate-pulse">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      <span className="text-teal-400 text-xs font-black tracking-wide font-mono">
        {viewers.toLocaleString()}
      </span>
    </div>
  );
};

// 🎬 MAIN VIDEO COMPONENT
export const FeaturedLiveTv = ({ onSelectChannel, selectedChannelId }) => {
  const featuredChannels = [
    { id: 1, name: "T Sports HD", category: "Sports", color: "from-emerald-500 to-teal-500" },
    { id: 15, name: "Ptv Sports", category: "Sports", color: "from-purple-500 to-indigo-600" },
    { id: 5, name: "Somoy Tv", category: "News", color: "from-red-500 to-rose-600" },
    { id: 44, name: "BTV News", category: "News", color: "from-blue-500 to-cyan-500" }
  ];

  const [activeChannel, setActiveChannel] = useState(featuredChannels[0]); 
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);

  const [streamError, setStreamError] = useState(false);
  
  const videoRef = useRef(null);

  useEffect(() => {
    if (selectedChannelId) {
      const matched = featuredChannels.find(c => c.id === selectedChannelId);
      if (matched) setActiveChannel(matched);
    }
  }, [selectedChannelId]);

  useEffect(() => {
    if (!activeChannel) return;

    const fetchStream = async () => {
      setLoading(true);
      setStreamData(null);
      try {
        const res = await fetch(`https://sanatvwork.yoursanaullah.workers.dev/?id=${activeChannel.id}`);
        const data = await res.json();
        setStreamData(data);
      } catch (err) {
        console.error('Error fetching stream URL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [activeChannel]);

  useEffect(() => {
    if (!streamData || !streamData.url || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        maxStarvationDelay: 4,
        maxLoadingDelay: 4,
        appendErrorMaxRetry: 5,
      });

      hls.loadSource(streamData.url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log('Autoplay prevented:', e));
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // 🔥 A 404 throws a fatal network error
              console.log('Stream link is dead (404) or network failed.');
              setStreamError(true); 
              setIsVideoBuffering(false);
              hls.destroy();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamData.url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((e) => console.log('Autoplay prevented:', e));
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamData]);

  const handleChannelClick = (channel) => {
    setActiveChannel(channel);
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-2">
      
      {/* --- TOP SECTION: VIDEO PLAYER --- */}
      <div className="w-full bg-[#020617] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video w-full flex items-center justify-center bg-black">
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]/90 z-20 gap-3 p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-teal-500"></div>
              <h3 className="text-gray-100 font-semibold text-sm sm:text-base">Resolving Media Link...</h3>
              <p className="text-gray-400 text-xs">Securing dynamic backend proxy tunnel</p>
            </div>
          )}

          {!loading && streamData ? (
            <>
              {isVideoBuffering && (
                <div className="absolute pointer-events-none z-20 inset-0 flex items-center justify-center bg-black/30">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-teal-500"></div>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                playsInline
                onWaiting={() => setIsVideoBuffering(true)}
                onPlaying={() => setIsVideoBuffering(false)}
                className="w-full h-full object-contain outline-none"
              />
            </>
          ) : (
            !loading && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <span className="text-3xl">📡</span>
                <h3 className="text-gray-400 text-sm font-medium">Ready to Stream</h3>
              </div>
            )
          )}
        </div>

        {/* Video Footer Metadata Panel */}
        <div className="p-4 border-t border-gray-900 bg-[#0b0f19] flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-teal-400">Now Streaming</span>
            <h2 className="text-gray-100 font-bold text-base sm:text-lg">
              {loading ? "Connecting..." : activeChannel?.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {/* 🔥 RENDER THE NEW API-POLLING COMPONENT HERE */}
            <LiveViewerBadge channelId={activeChannel?.id} />
            
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Live
            </span>
          </div>
        </div>
      </div>


      {/* --- PROFESSIONAL TV NEWS TICKER --- */}
      <style>
        {`
          @keyframes tv-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-tv-ticker {
            display: flex;
            width: max-content;
            animation: tv-ticker 30s linear infinite; /* 30s controls the speed */
            will-change: transform;
          }
          .animate-tv-ticker:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="w-full bg-[#0b0f19] border-y border-gray-800 relative flex items-center h-10 overflow-hidden shadow-md mt-0 mb-0">
        
        {/* Red 'LIVE UPDATE' Badge (Stays Fixed on Left) */}
        <div className="absolute left-0 top-0 bottom-0 bg-red-600 text-white text-[10px] sm:text-xs font-black px-3 sm:px-4 flex items-center uppercase tracking-widest z-20 shadow-[5px_0_15px_rgba(0,0,0,0.8)] border-r border-red-800">
          {/* Blinking Live Dot */}
          <span className="animate-pulse mr-2 h-2 w-2 bg-white rounded-full"></span>
          Update
        </div>

        {/* Seamless Scrolling Text Track */}
        <div className="flex-1 overflow-hidden pl-28 sm:pl-32 flex">
          <div className="animate-tv-ticker items-center cursor-default text-sm font-medium tracking-wide">
            {/* blank  */}
            {/* --- TRACK 1 --- */}
            <div className="flex items-center">
              {/* Bangla Text */}
              <span className="text-gray-200 whitespace-nowrap">
                টি-স্পোর্টস-এ বাফারিং হচ্ছে? কোনো সমস্যা ছাড়াই বিশ্বকাপ লাইভ দেখতে Ptv Sports বা বিটিভি সিলেক্ট করুন!
              </span>
              
              {/* TV Channel Dot Separator */}
              <span className="text-red-500 mx-6 font-bold text-xl">•</span>
              
              {/* English Text */}
              <span className="text-amber-400 whitespace-nowrap">
                Experiencing buffering on T-Sports? Switch to PTV Sports or BTV to watch the live World Cup stream!
              </span>
              
              {/* TV Channel Dot Separator */}
              <span className="text-red-500 mx-6 font-bold text-xl">•</span>
            </div>

            {/* --- TRACK 2 (Exact Duplicate to create the invisible loop) --- */}
            <div className="flex items-center">
              {/* Bangla Text */}
              <span className="text-gray-200 whitespace-nowrap">
                টি-স্পোর্টস-এ বাফারিং হচ্ছে? কোনো সমস্যা ছাড়াই বিশ্বকাপ লাইভ দেখতে Ptv Sports বা বিটিভি সিলেক্ট করুন!
              </span>
              
              {/* TV Channel Dot Separator */}
              <span className="text-red-500 mx-6 font-bold text-xl">•</span>
              
              {/* English Text */}
              <span className="text-amber-400 whitespace-nowrap">
                Experiencing buffering on T-Sports? Switch to PTV Sports or BTV to watch the live World Cup stream!
              </span>
              
              {/* TV Channel Dot Separator */}
              <span className="text-red-500 mx-6 font-bold text-xl">•</span>
            </div>

          </div>
        </div>
      </div>

      {/* --- ADVERTISEMENT SECTION --- */}
      <div className="w-full mt-0 mb-2 flex flex-col items-center">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
          Advertisement
        </span>
        <NativeAd />
      </div>

      {/* --- BOTTOM SECTION: 3 LIVE CHANNELS GRID --- */}
      <div className="w-full">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Quick Switch Stations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featuredChannels.map((channel) => {
            const isSelected = activeChannel?.id === channel.id;
            return (
              <div
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className={`group relative flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] shadow-md overflow-hidden ${
                  isSelected 
                    ? 'bg-gray-800/60 border-teal-500 shadow-teal-950/20' 
                    : 'bg-[#161925] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center shadow-sm`}>
                  <span className="text-sm">📺</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-100 font-bold text-sm group-hover:text-white transition-colors">
                    {channel.name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wide ${
                    isSelected ? 'text-teal-400' : 'text-gray-500'
                  }`}>
                    {channel.category}
                  </span>
                </div>
                
                {isSelected && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-xl" />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};