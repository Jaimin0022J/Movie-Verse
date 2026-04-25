import React, { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
const VideoPlayer = ({ url, title, poster, onReady, ...rest }) => {
  const artRef = useRef();

  useEffect(() => {
    if (!url) return;

    const art = new Artplayer({
      container: artRef.current,
      url: url,
      title: title,
      poster: poster,
      volume: 0.5,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: "#e50914",
      lang: "en",
      moreVideoAttr: {
        crossOrigin: "anonymous",
      },
      customType: {
        m3u8: function (video, url) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            art.notice.show = "Unsupported playback format: m3u8";
          }
        },
      },
      ...rest,
    });

    if (onReady && typeof onReady === "function") {
      onReady(art);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [url, title, poster]);

  return (
    <div 
      ref={artRef} 
      style={{ 
        width: "100%", 
        height: "100%", 
        background: "#000",
        borderRadius: "inherit"
      }}
    />
  );
};

export default VideoPlayer;
