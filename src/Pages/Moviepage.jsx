import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getMovieDetails,
  getMovieVideos,
  getMovieWatchProviders,
  getTVDetails,
  getTVVideos,
  getTVWatchProviders,
  getPosterUrl,
  getBackdropUrl,
} from "../Api/Api";
import Navbar from "../Components/Navbar";
import MovieCard from "../Components/MovieCard";
import StreamingSection from "../Components/StreamingSection";

const Moviepage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isTV = location.pathname.startsWith("/tv/");

  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const navigate = useNavigate();


  useEffect(() => {
    // Component remounts on ID change due to key prop in App.jsx
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (isTV) {
      getTVDetails(id)
        .then((data) => {
          setMovie(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load show.");
          setLoading(false);
        });

      getTVVideos(id)
        .then((results) => {
          const trailer = results.find(
            (v) => (v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
          );
          if (trailer) setTrailerKey(trailer.key);
        })
        .catch(() => {});

      getTVWatchProviders(id)
        .then((data) => {
          setWatchProviders(data);
        })
        .catch(() => {});
    } else {
      getMovieDetails(id)
        .then((data) => {
          setMovie(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load movie.");
          setLoading(false);
        });

      getMovieVideos(id)
        .then((results) => {
          const trailer = results.find(
            (v) => v.site === "YouTube" && v.type === "Trailer"
          );
          if (trailer) setTrailerKey(trailer.key);
        })
        .catch(() => {});

      getMovieWatchProviders(id)
        .then((data) => {
          setWatchProviders(data);
        })
        .catch(() => {});
    }
  }, [id, isTV]);





  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading movie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "24px 16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(229,9,20,0.1)",
            border: "1px solid rgba(229,9,20,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="ri-error-warning-line" style={{ color: "var(--accent-red)", fontSize: 36 }} />
        </div>
        <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 22 }}>
          {isTV ? "Series" : "Movie"} Unavailable
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: 400 }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          <i className="ri-arrow-left-line" />
          Go Back
        </button>
      </div>
    );
  }

  if (!movie) return null;

  const title = movie.title || movie.name || "Untitled";
  const poster = getPosterUrl(movie.poster_path, "w500");
  const backdrop = getBackdropUrl(movie.backdrop_path, "w1280");
  const rating = movie.vote_average?.toFixed(1) || "N/A";
  const ratingPct = Math.round((movie.vote_average || 0) * 10);
  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const similar = movie.similar?.results?.slice(0, 6) || [];
  const genres = movie.genres || [];
  const runtime = isTV 
    ? `${movie.number_of_seasons} Seasons` 
    : (movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null);
  const releaseDate = movie.release_date || movie.first_air_date || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar />

      <button
        onClick={() => navigate(-1)}
        style={{
          position: "fixed",
          top: "92px",
          left: "24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "50px",
          padding: "10px 20px",
          color: "#ffffff",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)"}
      >
        <i className="ri-arrow-left-line" />
        Back
      </button>

      <div className="page-enter" style={{ width: "100%" }}>

      <div
        style={{
          position: "relative",
          height: "65vh",
          minHeight: 450,
          overflow: "hidden",
        }}
      >
        {backdrop && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${backdrop})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              transition: "opacity 1s ease",
              transform: "scale(1.03)",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--overlay-hero-gradient-bot)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--overlay-hero-gradient)",
          }}
        />
      </div>
      <div
        className="px-[10px] lg:px-8 pb-[60px]"
        style={{
          maxWidth: 1200,
          margin: "-140px auto 0",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          <div
            className="animate-slide-left shrink-0 w-[200px] md:w-[260px] min-h-[300px] md:min-h-[390px] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)] border border-[var(--glass-border-light)] bg-[var(--bg-card)] mx-auto md:mx-0"
          >
            {!imgLoaded && (
              <div
                className="skeleton"
                style={{ width: "100%", height: "100%", minHeight: "300px" }}
              />
            )}
              {poster && (
                <img
                  src={poster}
                  alt={title}
                  style={{
                    width: "100%",
                    display: imgLoaded ? "block" : "none",
                    borderRadius: 20,
                  }}
                  onLoad={() => setImgLoaded(true)}
                />
              )}
          </div>

          <div
            className="animate-slide-right flex-1 min-w-full md:min-w-[280px] pt-2 md:pt-[120px] flex flex-col items-center md:items-start text-center md:text-left"
          >

            <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
              {genres.map((g) => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.8px",
                marginBottom: 12,
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h1>

            {movie.tagline && (
              <p
                style={{
                  color: "var(--accent-red)",
                  fontStyle: "italic",
                  fontSize: 15,
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                "{movie.tagline}"
              </p>
            )}

            <div
              className="flex flex-wrap gap-4 mb-6 items-center justify-center md:justify-start"
            >
              <span className="rating-badge" style={{ fontSize: 14, padding: "5px 12px" }}>
                <i className="ri-star-fill" />
                {rating} / 10
              </span>
              {releaseDate && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: 14,
                  }}
                >
                  <i className="ri-calendar-line" />
                  {releaseDate}
                </span>
              )}
              {runtime && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: 14,
                  }}
                >
                  <i className="ri-time-line" />
                  {runtime}
                </span>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                <span>Audience Score</span>
                <span style={{ fontWeight: 700, color: "var(--accent-gold)" }}>
                  {ratingPct}%
                </span>
              </div>
              <div className="rating-bar-track">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${ratingPct}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap mb-8 justify-center md:justify-start w-full">

               <button
                  onClick={() => {
                    setActiveTab("stream");
                    setTimeout(() => {
                      const target = document.getElementById('movie-tabs-container');
                      if (target) {
                        const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 110;
                        window.scrollTo({ top: topOffset, behavior: "smooth" });
                      }
                    }, 50);
                  }}
                  className="btn-primary"
                  style={{ background: "var(--accent-red)", padding: "12px 24px", fontSize: 16 }}
               >
                   <i className="ri-play-circle-fill" style={{ fontSize: 20, marginRight: 8 }} />
                   Watch Now
               </button>
              
              {trailerKey && (
                <button
                  onClick={() =>
                    window.open(`https://www.youtube.com/watch?v=${trailerKey}`, "_blank")
                  }
                  className="btn-secondary"
                  style={{ padding: "12px 24px", fontSize: 16 }}
                >
                  <i className="ri-youtube-fill" style={{ fontSize: 20, color: "#FF0000" }} />
                  Trailer
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          id="movie-tabs-container"
          style={{
            display: "flex",
            gap: 4,
            margin: "40px 0 0",
            borderBottom: "1px solid var(--glass-border-light)",
            paddingBottom: 0,
            overflowX: "auto",
          }}
        >
          {["stream", "about", "cast", "trailer", "watch", "similar"].map((tab) => (
            <button
              key={tab}
              className="content-tab"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab ? "var(--accent-red)" : "transparent"}`,
                color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 14,
                cursor: "pointer",
                textTransform: "capitalize",
                letterSpacing: 0.3,
              }}
            >
              {tab === "stream"  && <><i className="ri-play-circle-fill" style={{ marginRight: 6 }} />Stream</>}
              {tab === "about"   && <><i className="ri-information-line" style={{ marginRight: 6 }} />About</>}
              {tab === "cast"    && <><i className="ri-group-line" style={{ marginRight: 6 }} />Cast</>}
              {tab === "trailer" && <><i className="ri-youtube-fill" style={{ marginRight: 6 }} />Trailer</>}
              {tab === "watch"   && <><i className="ri-tv-2-line" style={{ marginRight: 6 }} />Watch On</>}
              {tab === "similar" && <><i className="ri-film-line" style={{ marginRight: 6 }} />Similar</>}
            </button>
          ))}
        </div>

        <div className="animate-fade-in" style={{ paddingTop: 32, minHeight: 300 }}>


          {activeTab === "stream" && (
            <div className="animate-fade-in" style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "10vh 0" }}>
              {isTV && movie.seasons && (
                <div style={{ display: "flex", gap: 12, marginBottom: 20, justifyContent: "flex-end", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--glass-bg)", padding: "4px 12px", borderRadius: 8, border: "1px solid var(--glass-border)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Season</span>
                    <select 
                      value={selectedSeason}
                      onChange={(e) => {
                         setSelectedSeason(e.target.value);
                         setSelectedEpisode(1);
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--text-primary)", outline: "none", cursor: "pointer", fontSize: 16 }}
                    >
                      {movie.seasons.filter(s => s.season_number > 0).map(s => (
                        <option key={s.season_number} value={s.season_number} style={{ background: "var(--bg-primary)" }}>
                          {s.season_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--glass-bg)", padding: "4px 12px", borderRadius: 8, border: "1px solid var(--glass-border)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Episode</span>
                    <select 
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(e.target.value)}
                      style={{ background: "transparent", border: "none", color: "var(--text-primary)", outline: "none", cursor: "pointer", fontSize: 16 }}
                    >
                      {Array.from({ length: movie.seasons.find(s => s.season_number == selectedSeason)?.episode_count || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1} style={{ background: "var(--bg-primary)" }}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <StreamingSection 
                tmdbId={id} 
                mediaType={isTV ? "tv" : "movie"} 
                season={selectedSeason} 
                episode={selectedEpisode}
                backdrop={backdrop}
              />
            </div>
          )}

          {activeTab === "about" && (
            <div className="animate-fade-in" style={{ maxWidth: 800, paddingBottom: 15 }}>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 16,
                  lineHeight: 1.85,
                  marginBottom: 32,
                }}
              >
                {movie.overview || "No description available."}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 16,
                }}
              >
                {[
                  { icon: "ri-star-fill", label: "Rating", value: `${rating} / 10`, color: "var(--accent-gold)" },
                  { icon: "ri-group-line", label: "Votes", value: movie.vote_count?.toLocaleString() || "—", color: "#60a5fa" },
                  { icon: "ri-global-line", label: "Language", value: (movie.original_language || "").toUpperCase() || "—", color: "#34d399" },
                  { icon: "ri-money-dollar-circle-line", label: "Budget", value: movie.budget ? `$${(movie.budget / 1e6).toFixed(0)}M` : "—", color: "#f472b6" },
                  { icon: "ri-bar-chart-line", label: "Revenue", value: movie.revenue ? `$${(movie.revenue / 1e6).toFixed(0)}M` : "—", color: "#a78bfa" },
                  { icon: "ri-time-line", label: "Runtime", value: runtime || "—", color: "#fb923c" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: 12,
                      padding: "16px 20px",
                      border: "1px solid var(--glass-border-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        color: "var(--text-muted)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      <i className={stat.icon} style={{ color: stat.color }} />
                      {stat.label}
                    </div>
                    <div
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cast" && (
            <div style={{ paddingBottom: 15 }}>
              {cast.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No cast information available.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: 20,
                  }}
                >
                  {cast.map((actor, i) => (
                    <div
                      key={actor.id}
                      className="animate-card-enter"
                      style={{
                        animationDelay: `${i * 60}ms`,
                        opacity: 0,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "2/3",
                          borderRadius: 12,
                          overflow: "hidden",
                          marginBottom: 10,
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--glass-border-light)",
                        }}
                      >
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--text-muted)",
                            }}
                          >
                            <i className="ri-user-line" style={{ fontSize: 36 }} />
                          </div>
                        )}
                      </div>
                      <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 12 }}>
                        {actor.name}
                      </p>
                      <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 3 }}>
                        {actor.character}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "trailer" && (
            <div style={{ maxWidth: 900, paddingBottom: 15 }}>
              {trailerKey ? (
                <div className="trailer-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0`}
                    title={isTV ? "Series Trailer" : "Movie Trailer"}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "80px 16px",
                    gap: 16,
                    color: "var(--text-muted)",
                    textAlign: "center",
                  }}
                >
                  <i className="ri-video-off-line" style={{ fontSize: 60 }} />
                  <p style={{ fontSize: 16, fontWeight: 600 }}>No trailer available</p>
                  {title && (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title + (isTV ? " series trailer" : " movie trailer"))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ textDecoration: "none" }}
                    >
                      <i className="ri-youtube-line" />
                      Search on YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "watch" && (() => {
            const regionData = watchProviders?.IN || watchProviders?.US || Object.values(watchProviders || {})[0];
            const streaming = regionData?.flatrate || [];
            const rent      = regionData?.rent      || [];
            const buy       = regionData?.buy       || [];
            const hasAny    = streaming.length > 0 || rent.length > 0 || buy.length > 0;
            const tmdbLink  = regionData?.link;

            const typeConfig = {
              stream: {
                label: "Streaming",
                sublabel: "Included with subscription",
                chipLabel: "FREE",
                chipIcon: "ri-shield-check-fill",
                chipClass: "wchip-free",
                accentColor: "#22c55e",
                accentGlow: "rgba(34,197,94,0.18)",
                headerIcon: "ri-play-circle-fill",
              },
              rent: {
                label: "Rent",
                sublabel: "Pay-per-view · Temporary access",
                chipLabel: "PAID",
                chipIcon: "ri-price-tag-3-fill",
                chipClass: "wchip-rent",
                accentColor: "#f59e0b",
                accentGlow: "rgba(245,158,11,0.18)",
                headerIcon: "ri-film-line",
              },
              buy: {
                label: "Buy",
                sublabel: "Own it digitally · Lifetime access",
                chipLabel: "PAID",
                chipIcon: "ri-shopping-bag-3-fill",
                chipClass: "wchip-buy",
                accentColor: "#818cf8",
                accentGlow: "rgba(129,140,248,0.18)",
                headerIcon: "ri-store-3-line",
              },
            };

            const ProviderSection = ({ providers, type }) => {
              const cfg = typeConfig[type];
              if (!providers.length) return null;
              return (
                <div className="watch-section">
                  <div className="watch-section-header">
                    <div className="watch-section-accent" style={{ background: cfg.accentColor }} />
                    <div>
                      <div className="watch-section-title" style={{ color: cfg.accentColor }}>
                        <i className={cfg.headerIcon} />
                        {cfg.label}
                      </div>
                      <div className="watch-section-sub">{cfg.sublabel}</div>
                    </div>
                    <span className={`watch-section-count`} style={{ background: cfg.accentGlow, color: cfg.accentColor, border: `1px solid ${cfg.accentColor}33` }}>
                      {providers.length} {providers.length === 1 ? "platform" : "platforms"}
                    </span>
                  </div>

                  <div className="watch-cards-row">
                    {providers.map((p, i) => (
                      <a
                        key={p.provider_id}
                        href={tmdbLink || `https://www.google.com/search?q=watch+${encodeURIComponent(title)}+on+${encodeURIComponent(p.provider_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="watch-card"
                        style={{ animationDelay: `${i * 50}ms` }}
                        title={`${cfg.label} on ${p.provider_name}`}
                      >
                        <div className="watch-card-logo-wrap" style={{ boxShadow: `0 0 0 2px ${cfg.accentColor}33` }}>
                          <img
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            className="watch-card-logo"
                          />
                        </div>
                        <div className="watch-card-info">
                          <span className="watch-card-name">{p.provider_name}</span>
                          <span className={`watch-card-chip ${cfg.chipClass}`}>
                            <i className={cfg.chipIcon} />
                            {cfg.chipLabel}
                          </span>
                        </div>
                        <i className="ri-arrow-right-s-line watch-card-arrow" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            };

            const regionName = watchProviders?.IN ? "India" : watchProviders?.US ? "United States" : "Your Region";

            return hasAny ? (
              <div className="watch-tab-root" style={{ paddingBottom: 15 }}>
                <div className="watch-tab-header">
                  <div className="watch-tab-icon-wrap">
                    <i className="ri-tv-2-fill" />
                  </div>
                  <div>
                    <h2 className="watch-tab-title">Where to Watch</h2>
                    <p className="watch-tab-region">
                      <i className="ri-map-pin-2-fill" style={{ color: "var(--accent-red)", marginRight: 5 }} />
                      Showing results for <strong>{regionName}</strong>
                    </p>
                  </div>
                </div>

                <ProviderSection providers={streaming} type="stream" />
                <ProviderSection providers={rent}      type="rent"   />
                <ProviderSection providers={buy}       type="buy"    />

                <div className="watch-tab-footer">
                  <i className="ri-information-line" />
                  Data sourced from{" "}
                  <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer">
                    JustWatch
                  </a>{" "}via TMDB · Availability may vary
                </div>
              </div>
            ) : (
              <div className="watch-empty-state" style={{ paddingBottom: 15 }}>
                <div className="watch-empty-icon">
                  <i className="ri-tv-2-line" />
                </div>
                <h3 className="watch-empty-title">Not Available for Streaming</h3>
                <p className="watch-empty-sub">
                  We couldn't find streaming info for your region right now.
                </p>
                <a
                  href={`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online+streaming`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: "none", marginTop: 8 }}
                >
                  <i className="ri-search-line" />
                  Search Where to Watch
                </a>
              </div>
            );
          })()}




          {activeTab === "similar" && (
            <div style={{ paddingBottom: 15 }}>
              {similar.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No similar movies found.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 20,
                  }}
                >
                  {similar.map((m, i) => (
                    <MovieCard key={m.id} movie={m} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}


        </div>
      </div>
      </div>
    </div>
  );
};

export default Moviepage;