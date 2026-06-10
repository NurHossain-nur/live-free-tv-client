import React, { useState, useEffect } from 'react';

export const InstallAppBanner = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop'); // 'android', 'ios', 'in-app', 'desktop'
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if it's already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();

    // 2. Detect In-App Browsers (Facebook, Messenger, Instagram)
    if (userAgent.includes('fban') || userAgent.includes('fbav') || userAgent.includes('instagram')) {
      setDeviceType('in-app');
      return;
    }

    // 3. Detect iOS
    if (/ipad|iphone|ipod/.test(userAgent) && !window.MSStream) {
      setDeviceType('ios');
      return;
    }

    // 4. Detect Android & Capture Native Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Stop the automatic banner from flashing
      setInstallPromptEvent(e); // Save it to trigger later
      setDeviceType('android');
    };

    // 🔥 NEW: Detect the exact moment the installation finishes!
    const handleAppInstalled = () => {
      setIsInstalled(true); // This instantly makes the banner disappear!
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deviceType === 'android' && installPromptEvent) {
      // Trigger the native Android install prompt
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPromptEvent(null);
    } else if (deviceType === 'ios') {
      // Show manual iOS instructions
      setShowIosInstructions(true);
    }
  };

  // If already installed, hide the banner
  if (isInstalled) return null;

  return (
    <>
      {/* --- THE STICKY BOTTOM BANNER --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#161925] border-t border-teal-500/30 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm">Get the SportBC App</span>
          <span className="text-gray-400 text-xs">Watch live matches faster!</span>
        </div>

        {deviceType === 'in-app' ? (
          <div className="text-xs text-rose-400 font-bold max-w-[150px] text-right">
            Tap the 3 dots (•••) and select "Open in System Browser" to install.
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="bg-teal-500 hover:bg-teal-400 text-[#0f111a] font-bold py-2 px-5 rounded-lg text-sm transition-colors"
          >
            Install App
          </button>
        )}
      </div>

      {/* --- IOS INSTRUCTIONS MODAL --- */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1e232b] border border-gray-700 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center gap-4 relative">
            <button 
              onClick={() => setShowIosInstructions(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-white font-bold text-lg">Install on iPhone</h3>
            <p className="text-gray-300 text-sm">
              Apple requires you to install this manually. It only takes 2 seconds!
            </p>
            <ol className="text-left text-gray-400 text-sm flex flex-col gap-3 w-full bg-[#161925] p-4 rounded-xl border border-gray-800">
              <li>1. Tap the <strong>Share</strong> button at the bottom of your Safari browser.</li>
              <li>2. Scroll down and tap <strong>"Add to Home Screen"</strong> ➕.</li>
              <li>3. Tap <strong>"Add"</strong> in the top right corner.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};