import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

// 1. Reusable Player Component for testing individual links
const HlsPlayer = ({ src, title, quality }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        // Standard testing configs
        maxBufferLength: 30,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari Support
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <div className="flex flex-col gap-3 bg-[#161925] p-4 rounded-xl border border-gray-800 shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-100 font-bold text-lg">{title}</h3>
        <span className="bg-teal-500/20 text-teal-400 text-xs font-bold px-2 py-1 rounded">
          {quality}
        </span>
      </div>
      
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-900">
        <video 
          ref={videoRef} 
          controls 
          className="w-full h-full outline-none"
        />
      </div>
      
      <div className="text-xs text-gray-500 break-all font-mono bg-black/50 p-2 rounded">
        URL: {src}
      </div>
    </div>
  );
};

// 2. The Main Test Page
export const TestStreamsPage = () => {
  return (
    <div className="min-h-screen bg-[#0f111a] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Internal Stream Tester</h1>
          <p className="text-gray-400 text-sm">Comparing HLS (.m3u8) playback stability and quality</p>
        </div>

        {/* Responsive Grid: Side-by-side on PC, stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          
          {/* Feed 1: HD */}
          <HlsPlayer 
            title="T Sports (Feed 1)" 
            quality="HD" 
            src="https://tvsen7.aynaott.com/tsports-hd/index.m3u8" 
          />

          {/* Feed 2: FHD */}
          <HlsPlayer 
            title="T Sports (Feed 2)" 
            quality="FHD" 
            src="https://tvsen7.aynaott.com/tsportsfhd/index.m3u8" 
          />

        </div>
      </div>
    </div>
  );
};

export default TestStreamsPage;