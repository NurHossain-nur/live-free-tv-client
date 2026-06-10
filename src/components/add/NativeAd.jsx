import React, { useEffect } from 'react';

export const NativeAd = () => {
  useEffect(() => {
    // 1. Prevent React from injecting the script multiple times on re-renders
    const scriptId = 'adsterra-native-script-91279';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.dataset.cfasync = "false";
      
      // Your exact Adsterra script source
      script.src = "https://pl29698433.effectivecpmnetwork.com/9127909b59c038a619317abdf6266f0b/invoke.js"; 
      
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full p-2 my-4 bg-gray-900/40 rounded-xl border border-gray-800 flex justify-center items-center min-h-[120px] overflow-hidden">
      {/* Your exact Adsterra container ID */}
      <div id="container-9127909b59c038a619317abdf6266f0b"></div>
    </div>
  );
};