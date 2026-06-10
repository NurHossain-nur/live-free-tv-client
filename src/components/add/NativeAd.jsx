import React from 'react';

export const NativeAd = () => {
  // We write the pure HTML for the ad inside a string
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html { 
            margin: 0; padding: 0; width: 100%; height: 100%; 
            display: flex; justify-content: center; align-items: center; 
            overflow: hidden; background-color: transparent; 
          }
        </style>
      </head>
      <body>
        <div id="container-9127909b59c038a619317abdf6266f0b"></div>
        <script async="async" data-cfasync="false" src="https://pl29698433.effectivecpmnetwork.com/9127909b59c038a619317abdf6266f0b/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="w-full p-2 bg-gray-900/40 rounded-xl border border-gray-800 flex justify-center items-center min-h-[120px] overflow-hidden">
      {/* The srcDoc property forces the browser to treat this string as a brand new, isolated website every single time React renders it! */}
      <iframe
        srcDoc={iframeContent}
        title="Advertisement"
        className="w-full h-[120px] border-none bg-transparent"
        scrolling="no"
      />
    </div>
  );
};