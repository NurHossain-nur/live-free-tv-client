// 1. IMPORT AND SETUP SOCKET AT THE VERY TOP
import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { io } from 'socket.io-client';
import { NativeAd } from '../add/NativeAd';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-render-backend.onrender.com';
const socket = io(BACKEND_URL, { 
  autoConnect: true, 
  transports: ['websocket'] 
});

// 🔥 2. THE NEW ISOLATED COUNTER COMPONENT
const LiveViewerBadge = ({ channelId }) => {
  const [viewers, setViewers] = useState(1);

  useEffect(() => {
    // Listen for updates ONLY inside this tiny component
    const handleUpdate = (count) => setViewers(count);
    socket.on('viewer_update', handleUpdate);

    // Tell server we joined
    if (channelId) {
      socket.emit('join_channel', channelId);
    }

    return () => {
      socket.off('viewer_update', handleUpdate);
      if (channelId) {
        socket.emit('leave_channel', channelId);
      }
    };
  }, [channelId]);

  return (
    <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg shadow-inner">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        className="w-4 h-4 text-teal-400 animate-pulse"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      <span className="text-teal-400 text-xs font-black tracking-wide font-mono">
        {viewers.toLocaleString()}
      </span>
    </div>
  );
};