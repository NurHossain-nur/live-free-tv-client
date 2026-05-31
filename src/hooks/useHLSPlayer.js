import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export const useHLSPlayer = (streamUrl) => {
  const videoRef = useRef(null);
  const [hlsInstance, setHlsInstance] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    let hls = null;
    setIsError(false);

    // Check if browser supports HLS natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((e) => console.log('Autoplay prevented', e));
      });
    } 
    // Otherwise, use hls.js (Chrome, Firefox, Edge)
    else if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        enableWorker: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log('Autoplay prevented', e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS Network Error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS Media Error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('HLS Fatal Error. Cannot recover.');
              setIsError(true);
              hls.destroy();
              break;
          }
        }
      });

      setHlsInstance(hls);
    } else {
      console.error('HLS is not supported in this browser.');
      setIsError(true);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  return { videoRef, isError, hlsInstance };
};