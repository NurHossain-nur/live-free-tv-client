import React from 'react';

export const NativeAd = () => {
  return (
    <div className="w-full p-2 bg-gray-900/40 rounded-xl border border-gray-800 flex justify-center items-center min-h-[120px] overflow-hidden">
      
      {/* The iframe acts as a firewall, forcing Adsterra to load fresh every time! */}
      <iframe
        src="/native-ad.html"
        title="Advertisement"
        className="w-full h-[120px] border-none overflow-hidden bg-transparent"
        scrolling="no"
      />
      
    </div>
  );
};