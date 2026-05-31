import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

const LiveStreamingPlayer = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isFetchingChannels, setIsFetchingChannels] = useState(true);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);

  const videoRef = useRef(null);
  

  // 1. Fetch initial channel list on mount
  useEffect(() => {
    fetch('https://sanatvwork.yoursanaullah.workers.dev/')
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch((err) => console.error('Error fetching channel list:', err))
      .finally(() => setIsFetchingChannels(false));
  }, []);

  // 2. Fetch specific stream when a channel is selected
  const handleSelectChannel = async (channel) => {
    setSelectedChannel(channel);
    setLoading(true);
    setStreamData(null);

    try {
      const res = await fetch(`https://sanatvwork.yoursanaullah.workers.dev/?id=${channel.id}`);
      const data = await res.json();
      setStreamData(data);
    } catch (err) {
      console.error('Error fetching stream URL:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Attach HLS stream with performance tuning configurations
  useEffect(() => {
    if (!streamData || !streamData.url || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      // 🔥 Performance Configs to stop the 15-second loop freezing
      hls = new Hls({
        enableWorker: true,            // Moves video parsing to a separate thread so UI doesn't stall
        maxBufferLength: 30,           // Forces the player to buffer up to 30 seconds ahead (instead of default 10s)
        maxMaxBufferLength: 60,        // Allows maximum buffering up to 60 seconds if network is fast
        liveSyncDurationCount: 3,      // Starts playback 3 segments behind live edge to ensure stable buffer supply
        liveMaxLatencyDurationCount: 10, // Max latency allowed before catching up
        maxStarvationDelay: 4,         // Reduces time spent waiting during low-speed drops
        maxLoadingDelay: 4,
        appendErrorMaxRetry: 5,        // Auto-retry if segment appending fails temporarily
      });

      hls.loadSource(streamData.url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log('Autoplay prevented:', e));
      });

      // 🛠️ Error recovery loop: If a network segment drops, auto-recover instantly instead of freezing
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.log('Unrecoverable error, re-initializing stream...');
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native fallback (Safari / iOS) handles buffering automatically
      video.src = streamData.url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((e) => console.log('Autoplay prevented:', e));
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamData]);

  // Derived state for categories and filtering
  const categories = ['All', ...new Set(channels.map((c) => c.category).filter(Boolean))];
  const filteredChannels = channels.filter(
    (c) => selectedCategory === 'All' || c.category === selectedCategory
  );

  return (
    <>
      {/* Embedded CSS for responsive design and UI polishing */}
      <style>{`
        .live-app-container {
          display: flex;
          height: 100dvh;
          background-color: #0f172a;
          color: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }

        /* Sidebar Styles */
        .live-sidebar {
          width: 320px;
          background-color: #0f172a;
          border-right: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          z-index: 10;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #1e293b;
          background-color: #0f172a;
        }

        .category-select {
          width: 100%;
          padding: 10px 12px;
          margin-top: 12px;
          background-color: #1e293b;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .category-select:focus {
          border-color: #3b82f6;
        }

        .channel-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Scrollbar styling */
        .channel-list::-webkit-scrollbar { width: 6px; }
        .channel-list::-webkit-scrollbar-track { background: transparent; }
        .channel-list::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

        .channel-btn {
          display: flex;
          flex-direction: column;
          text-align: left;
          padding: 14px;
          background-color: #1e293b;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .channel-btn:hover {
          background-color: #334155;
          transform: translateY(-1px);
        }

        .channel-btn.active {
          background-color: #2563eb;
          border-color: #60a5fa;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .channel-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .channel-category {
          font-size: 12px;
          color: #94a3b8;
        }

        .channel-btn.active .channel-category {
          color: #bfdbfe;
        }

        /* Main Viewport Styles */
        .live-main-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 32px;
          justify-content: center;
          align-items: center;
          background-color: #020617;
          overflow-y: auto;
        }

        .video-wrapper {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .video-container {
          position: relative;
          width: 100%;
          background-color: #000;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/9;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 1px solid #1e293b;
        }

        .loading-text, .empty-state {
          color: #64748b;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 860px) {
          .live-app-container {
            flex-direction: column;
          }

          .live-main-view {
            order: 1; /* Puts video on top */
            flex: none;
            padding: 16px;
            height: auto;
            border-bottom: 1px solid #1e293b;
          }

          .live-sidebar {
            order: 2; /* Puts channel list below */
            width: 100%;
            flex: 1; /* Takes remaining height */
            border-right: none;
          }

          .video-wrapper {
            margin-top: 0;
          }
        }

        /* Spinner Styles */
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        .spinner-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          z-index: 20;
          pointer-events: none; /* Lets clicks pass through to the video */
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="live-app-container">
        
        {/* Sidebar: Channel List & Filters */}
        <div className="live-sidebar">
          <div className="sidebar-header">
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Live Channels</h2>
            
            {/* Category Filter */}
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="channel-list">
            {isFetchingChannels ? (
              <div className="spinner"></div>
            ) : filteredChannels.length > 0 ? (
              filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel)}
                  className={`channel-btn ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                >
                  <span className="channel-name">{channel.name}</span>
                  <span className="channel-category">{channel.category}</span>
                </button>
              ))
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>
                No channels found.
              </div>
            )}
          </div>
        </div>

        {/* Main Viewport: Video Player */}
        <div className="live-main-view">
          {loading && (
            <div className="loading-text">

                <div className="spinner"></div>
              <h3 style={{ margin: 0 }}>Resolving Media Link...</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Please wait securely establishing connection.</p>
            </div>
          )}
          
          {!loading && streamData && (
            <div className="video-wrapper">
              <h2 style={{ margin: 0, fontSize: '24px' }}>{streamData.name}</h2>
              <div className="video-container">
                
                {/* ADD THIS LINE: */}
                {isVideoBuffering && <div className="spinner spinner-overlay"></div>}

                <video
                  ref={videoRef}
                  controls
                  playsInline
                  // ADD THESE TWO LINES:
                  onWaiting={() => setIsVideoBuffering(true)}
                  onPlaying={() => setIsVideoBuffering(false)}
                  style={{ width: '100%', height: '100%', outline: 'none' }}
                />
              </div>
            </div>
          )}

          {!loading && !streamData && (
            <div className="empty-state">
              <h2 style={{ margin: 0, color: '#94a3b8' }}>No Channel Selected</h2>
              <p style={{ margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                Select an active station from the channel list to initialize the live media stream.
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default LiveStreamingPlayer;