import React, { useEffect, useRef } from 'react';

export const NativeAd = () => {
  const adContainerRef = useRef(null);

  useEffect(() => {
    const containerId = "container-9127909b59c038a619317abdf6266f0b";
    const scriptSrc = "https://pl29698433.effectivecpmnetwork.com/9127909b59c038a619317abdf6266f0b/invoke.js";

    if (adContainerRef.current) {
      // 1. Assign the strict Adsterra ID and wipe it clean
      adContainerRef.current.id = containerId;
      adContainerRef.current.innerHTML = '';

      // 2. HUNT DOWN AND DELETE OLD SCRIPTS: 
      // This is the magic fix! It destroys the script from the previous tab
      // so Adsterra is forced to show the ad again on the new tab.
      const oldScripts = document.querySelectorAll(`script[src="${scriptSrc}"]`);
      oldScripts.forEach(script => script.remove());

      // 3. Inject a brand new script directly into the container
      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = scriptSrc;
      
      adContainerRef.current.appendChild(script);
    }

    // 4. CLEANUP: When you click away to another page, destroy the ad contents
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full p-2 bg-gray-900/40 rounded-xl border border-gray-800 flex justify-center items-center min-h-[120px] overflow-hidden">
      {/* The Adsterra Banner will inject perfectly right here */}
      <div ref={adContainerRef} className="w-full flex justify-center"></div>
    </div>
  );
};