import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { NativeAd } from '../add/NativeAd';

export const FeaturedLiveTv = ({ onSelectChannel, selectedChannelId }) => {
  const featuredChannels = [
    { id: 1, name: "T Sports HD", category: "Sports", color: "from-emerald-500 to-teal-500" },
    { id: 5, name: "Somoy Tv", category: "News", color: "from-red-500 to-rose-600" },
    { id: 44, name: "BTV News", category: "News", color: "from-blue-500 to-cyan-500" }
  ];

  // Internal streaming states
  const [activeChannel, setActiveChannel] = useState(featuredChannels[0]); // Default to first channel
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  
  const videoRef = useRef(null);

  // Sync internal state if a channel is selected from a parent component
  useEffect(() => {
    if (selectedChannelId) {
      const matched = featuredChannels.find(c => c.id === selectedChannelId);
      if (matched) setActiveChannel(matched);
    }
  }, [selectedChannelId]);

  // 1. Fetch specific stream when active channel changes
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

  // 2. Attach HLS stream with your custom performance tuning rules
  useEffect(() => {
    if (!streamData || !streamData.url || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,              // Background parsing thread
        maxBufferLength: 30,             // 30s forward buffer
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,        // Stable 3-segment safety gap
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

      // Rapid error recovery loops
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error, recovering...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, recovering...');
              hls.recoverMediaError();
              break;
            default:
              console.log('Unrecoverable error, destroying...');
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Apple Native Engine (Safari/iOS)
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
    // Bubble event to parent state if callback exists
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-2">
      
      {/* --- TOP SECTION: VIDEO PLAYER --- */}
      <div className="w-full bg-[#020617] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video w-full flex items-center justify-center bg-black">
          
          {/* Main Resolution Loader */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]/90 z-20 gap-3 p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-teal-500"></div>
              <h3 className="text-gray-100 font-semibold text-sm sm:text-base">Resolving Media Link...</h3>
              <p className="text-gray-400 text-xs">Securing dynamic backend proxy tunnel</p>
            </div>
          )}

          {/* Active Stream Viewport */}
          {!loading && streamData ? (
            <>
              {/* Dynamic Buffer Spinner */}
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
            // Idle State Layout
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
          <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Live
          </span>
        </div>
      </div>

      {/* --- ADVERTISEMENT SECTION --- */}
      <div className="w-full mt-6 mb-2 flex flex-col items-center">
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
                
                {/* Active Indicator Bar */}
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