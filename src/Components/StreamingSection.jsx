import React, { useState } from "react";

const SERVERS = [
  {
    id: "vidlink",
    name: "Premium Server",
    description: "(Ultra Fast / No Buffering)",
    referrerPolicy: "origin",
    getUrl: (mediaType, tmdbId, season, episode) => 
      mediaType === 'tv' 
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
        : `https://vidlink.pro/movie/${tmdbId}`
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    description: "(Alternative Multi-Server)",
    referrerPolicy: "origin",
    getUrl: (mediaType, tmdbId, season, episode) => 
      mediaType === 'tv' 
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
  }
];

export default function StreamingSection({ tmdbId, mediaType = "movie", season = 1, episode = 1, backdrop }) {
  const [selectedServerId, setSelectedServerId] = useState(SERVERS[0].id);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const selectedServer = SERVERS.find(s => s.id === selectedServerId) || SERVERS[0];
  const currentUrl = selectedServer.getUrl(mediaType, tmdbId, season, episode);

  return (
    <div id="streaming-section-target" className="w-full max-w-5xl mx-auto px-[10px] lg:px-8 py-10">
      {/* Server Selection Header */}
      {isPlayerVisible && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900/80 backdrop-blur-md p-4 rounded-t-xl border-x border-t border-blue-500/50 mb-0">
          <div className="text-white flex items-center gap-2 mb-3 sm:mb-0">
            <i className="ri-server-line text-blue-400"></i>
            <span className="font-semibold text-sm">Select Server:</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {SERVERS.map((server) => (
              <button
                key={server.id}
                onClick={() => setSelectedServerId(server.id)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                  selectedServerId === server.id
                    ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)] border border-blue-400"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600 hover:text-white"
                }`}
              >
                {server.name} <span className="opacity-70 font-normal ml-1 hidden sm:inline">{server.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div className={`relative w-full aspect-video ${isPlayerVisible ? 'rounded-b-xl' : 'rounded-xl'} border ${isPlayerVisible ? 'border-t-0' : ''} border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] overflow-hidden bg-black group transition-all duration-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]`}>
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
