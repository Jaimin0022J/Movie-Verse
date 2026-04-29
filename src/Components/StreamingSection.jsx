import React, { useState } from "react";

const SERVERS = [
  {
    id: "superembed",
    name: "SuperEmbed",
    description: "(Multi-audio / Hindi)",
    referrerPolicy: "origin",
    getUrl: (mediaType, tmdbId, season, episode) => 
      mediaType === 'tv' 
        ? `https://multiembed.cc/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://multiembed.cc/embed/movie/${tmdbId}`
  }
];

export default function StreamingSection({ tmdbId, mediaType = "movie", season = 1, episode = 1, backdrop }) {
  const selectedServer = SERVERS[0];
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const currentUrl = selectedServer.getUrl(mediaType, tmdbId, season, episode);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      {/* Video Player Container */}
      <div className="relative w-full aspect-video rounded-xl border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] overflow-hidden bg-black group transition-all duration-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]">
        {!isPlayerVisible ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {backdrop && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-700 group-hover:opacity-50"
                style={{ backgroundImage: `url(${backdrop})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            
            <button
              onClick={() => setIsPlayerVisible(true)}
              className="relative z-10 flex flex-col items-center transition-transform duration-300 hover:scale-110 group"
            >
              <div className="w-20 h-20 rounded-full bg-blue-600/80 backdrop-blur-md flex items-center justify-center border border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)] mb-4 transition-all group-hover:bg-blue-500 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.8)]">
                <i className="ri-play-fill text-4xl text-white ml-2"></i>
              </div>
              <span className="text-white font-bold text-xl tracking-wider uppercase drop-shadow-md">
                Watch Now
              </span>
            </button>
          </div>
        ) : (
          <iframe
            src={currentUrl}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy={selectedServer.referrerPolicy || "no-referrer-when-downgrade"}
            title="Video Player"
          />
        )}
      </div>
    </div>
  );
}
