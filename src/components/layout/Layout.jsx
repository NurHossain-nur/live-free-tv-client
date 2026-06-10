import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { InstallAppBanner } from '../application/InstallAppBanner';

// ==========================================
// 1. PWA INSTALL HOOK (With Custom Pre-Prompt & iOS)
// ==========================================
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect iOS devices
    const isIosDevice = /d(evice|roid)/i.test(navigator.userAgent) === false && 
                        /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      setIsInstallable(true);
    }

    // 2. Check if already running as an installed app
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // 3. Intercept the ugly native browser prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); 
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    // 🍎 Scenario A: iOS Users (Show instructions)
    if (isIOS) {
      Swal.fire({
        title: 'Install SportBC on iOS',
        html: `
          <div style="text-align: left; font-size: 14px; color: #f3f4f6; padding: 5px 0;">
            <p style="margin-bottom: 14px;">To install this app on your iPhone/iPad:</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <span style="font-size: 18px;">1️⃣</span> <span>Tap the <strong style="color: #14b8a6;">Share</strong> button <span style="font-size: 18px;">⎋</span></span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">2️⃣</span> <span>Scroll down and tap <strong style="color: #14b8a6;">Add to Home Screen</strong> <span style="font-size: 18px;">➕</span></span>
            </div>
          </div>
        `,
        imageUrl: '/sportbc_logo_192.png',
        imageWidth: 70,
        imageHeight: 70,
        background: '#161925',
        color: '#f3f4f6',
        showConfirmButton: true,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#14b8a6', 
        width: 380,
        customClass: {
          popup: 'border border-gray-800 rounded-2xl shadow-2xl'
        }
      });
      return;
    }

    // 🤖 Scenario B: Android/Chrome/PC
    if (!deferredPrompt) return;

    // 🌟 STEP 1: Show YOUR beautiful custom alert first!
    const result = await Swal.fire({
      title: 'Install SportBC PRO?',
      text: 'Get the full-screen immersive Live TV experience directly on your home screen with faster loading!',
      imageUrl: '/sportbc_logo_192.png', // Uses your perfect 192x192 logo
      imageWidth: 80,
      imageHeight: 80,
      showCancelButton: true,
      confirmButtonText: 'Yes, Install',
      cancelButtonText: 'Later',
      confirmButtonColor: '#14b8a6', // Teal 500
      cancelButtonColor: '#374151',  // Gray 700
      reverseButtons: true,
      background: '#161925',
      color: '#f3f4f6',
      customClass: {
        popup: 'border border-gray-800 rounded-2xl shadow-2xl'
      }
    });

    // 🌟 STEP 2: If they clicked "Yes", trigger the native browser box
    if (result.isConfirmed) {
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        
        // Success Toast
        Swal.fire({
          title: 'Awesome!',
          text: 'SportBC PRO has been added to your home screen.',
          icon: 'success',
          background: '#161925',
          color: '#f3f4f6',
          confirmButtonColor: '#14b8a6',
          timer: 2500,
          showConfirmButton: false
        });
      }
      setDeferredPrompt(null);
    }
  };

  return { isInstallable, isInstalled, handleInstall };
};

// ==========================================
// 2. TOP NAV COMPONENT (Unchanged)
// ==========================================
export const TopNav = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#161925]/95 backdrop-blur-md px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg">
      <Link 
        to="/" 
        className="group flex items-center gap-2 sm:gap-3 transition-transform duration-200 hover:scale-[1.02] shrink-0"
      >
        <div className="relative flex items-center justify-center bg-white/5 p-1 sm:p-1.5 rounded-lg border border-gray-700/50 shadow-sm group-hover:border-teal-500/50 transition-colors">
          <img 
            src="/sportbc_logo_1.png" 
            alt="SportBC Logo" 
            className="h-7 w-auto sm:h-9 object-contain" 
          />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-500 text-transparent bg-clip-text font-black text-lg sm:text-2xl tracking-tight">
            SportBC
          </div>
          <span className="bg-teal-500/10 text-teal-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-teal-500/20">
            PRO
          </span>
        </div>
      </Link>

      <nav className="flex items-center gap-0.5 sm:gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800 shrink-0">
        <Link
          to="/"
          className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
            location.pathname === '/'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <span className="hidden sm:inline mr-1">🔥</span>Matches
        </Link>
        <Link
          to="/live-tv"
          className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
            location.pathname === '/live-tv'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <span className="hidden sm:inline mr-1">📺</span>Live TV
        </Link>
        <Link
          to="/stats"
          className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider transition-all ${
            location.pathname === '/stats'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <span className="hidden sm:inline mr-1">📊</span>Stats
        </Link>
      </nav>
    </header>
  );
};

// ==========================================
// 3. LAYOUT COMPONENT (Unchanged)
// ==========================================
export const Layout = ({ children }) => {
  const { isInstallable, isInstalled, handleInstall } = usePWAInstall();
  const [dismissBanner, setDismissBanner] = useState(false);

  // We only show the download UI if the browser says it's installable,
  // it hasn't been installed yet, and the user hasn't dismissed it.
  const showDownloadUI = isInstallable && !isInstalled;

  return (
    <div className="min-h-screen bg-[#0f111a] flex flex-col relative pb-16">
      <TopNav />

      <InstallAppBanner />

      {/* 🔽 TOP DOWNLOAD BANNER */}
      {showDownloadUI && !dismissBanner && (
        <div className="w-full bg-gradient-to-r from-[#161925] via-teal-900/40 to-[#161925] border-b border-teal-500/30 px-4 py-3 flex items-center justify-between shadow-inner animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-500/50">
              <span className="text-teal-400 text-lg">📱</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-200 text-sm font-bold">Get the SportBC App</span>
              <span className="text-gray-400 text-xs hidden sm:block">Watch live matches full-screen without browser interruptions.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={handleInstall}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded transition-colors"
            >
              Install
            </button>
            <button 
              onClick={() => setDismissBanner(true)}
              className="text-gray-500 hover:text-gray-300 p-1 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 py-4 md:py-6 pb-24">
        {children}
      </main>

      {/* ↘️ FLOATING DOWNLOAD BUTTON (Bottom Right) */}
      {/* {showDownloadUI && (
        <button
          onClick={handleInstall}
          className="fixed bottom-16 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 px-5 py-3 rounded-full font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-transform hover:scale-105 active:scale-95 animate-bounce-slow"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden sm:inline">Install App</span>
        </button>
      )} */}
      
    </div>
  );
};