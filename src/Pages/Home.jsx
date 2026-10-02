import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../Components/MovieCard";
import Navbar from "../Components/Navbar";
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getNowPlaying,
  getUpcomingMovies,
  searchMovies,
  searchMulti,
  getGenres,
  getMoviesByGenre,
  getBackdropUrl,
  getPosterUrl,
  getBollywoodMovies,
  getLatestMovies,
  getLatestTV,
  getAnimeMovies,
} from "../Api/Api";

const TABS = [
  { id: "latest",     label: "🆕 Latest",                 icon: "ri-calendar-check-fill" },
  { id: "trending",   label: "🔥 Trending",               icon: "ri-fire-fill" },
  { id: "popular",    label: "🎬 Popular",                icon: "ri-film-fill" },
  { id: "top_rated",  label: "⭐ Top Rated",              icon: "ri-award-fill" },
  { id: "now",        label: "🎭 Now Playing",            icon: "ri-live-fill" },
  { id: "bollywood",  label: "🇮🇳 Bollywood",              icon: "ri-map-pin-2-fill" },
  { id: "anime",      label: "🌸 Anime",                  icon: "ri-play-circle-fill" },
  { id: "upcoming",   label: "⏳ Upcoming",               icon: "ri-time-line" },
];

const Home = ({ addToFavorite, favorites = [] }) => {
  const navigate = useNavigate();
  const [searchMovie, setSearchMovie] = useState("");
  const [movies, setMovies] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Dedicated Upcoming Movies section state
  const [upcomingList, setUpcomingList] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const upcomingScrollRef = useRef(null);

  const searchTimeout = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {});
  }, []);

  // Fetch dedicated upcoming movies for the showcase section
  useEffect(() => {
    setUpcomingLoading(true);
    getUpcomingMovies(1)
      .then((data) => {
        setUpcomingList(data.slice(0, 16));
      })
      .catch(() => {})
      .finally(() => setUpcomingLoading(false));
  }, []);

  const fetchMovies = useCallback(async (forceSearch = null, forceGenre = null, forceTab = null) => {
    const activeSearch = forceSearch !== null ? forceSearch : searchMovie;
    const activeGen = forceGenre !== null ? forceGenre : selectedGenre;
    const activeT = forceTab !== null ? forceTab : activeTab;

    setLoading(true);
    setError(null);

    try {
      const getResults = async (p) => {
        if (activeSearch.trim()) return await searchMulti(activeSearch, p);
        if (activeGen) return await getMoviesByGenre(activeGen, p);
        if (activeT === "trending")  return await getTrendingMovies("week", p);
        if (activeT === "popular")   return await getPopularMovies(p);
        if (activeT === "top_rated") return await getTopRatedMovies(p);
        if (activeT === "now")       return await getNowPlaying(p);
        if (activeT === "bollywood") return await getBollywoodMovies(p);
        if (activeT === "anime")     return await getAnimeMovies(p);
        if (activeT === "latest")    return await getLatestMovies(p);
        if (activeT === "upcoming")  return await getUpcomingMovies(p);
        return await getPopularMovies(p);
      };

      // Fetch one page to display exactly 20 items and improve performance
      const combinedResults = await getResults(1);

      // Filter out items without posters
      // For released movies (all default tabs, hero, and search), strictly require release_date <= today
      const today = new Date().toISOString().split("T")[0];
      const isUpcomingTab = activeT === "upcoming";

      const validResults = combinedResults.filter(movie => {
        if (!movie.poster_path) return false;
        const rDate = movie.release_date || movie.first_air_date;
        if (isUpcomingTab) {
          return Boolean(rDate && rDate > today);
        }
        // Strict release check: MUST have a valid non-empty release date and MUST NOT be in the future
        if (!rDate || typeof rDate !== "string" || rDate.trim() === "" || rDate > today) {
          return false;
        }
        return true;
      });

      setMovies(validResults);

      if (validResults.length > 0) {
        // Ensure hero movies are strictly released movies that have backdrops
        const releasedOnly = validResults.filter(m => {
          const rDate = m.release_date || m.first_air_date;
          return rDate && rDate <= today;
        });
        const pool = releasedOnly.length > 0 ? releasedOnly : validResults;
        const validHero = pool.filter(m => m.backdrop_path);
        setHeroMovies(validHero.length > 0 ? validHero.slice(0, 5) : pool.slice(0, 5));
        setHeroIndex(0);
      } else {
        setHeroMovies([]);
      }
    } catch {
      setError("Failed to load movies. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [searchMovie, selectedGenre, activeTab]);



  useEffect(() => {
    clearTimeout(searchTimeout.current);
    
    if (!searchMovie.trim()) {
      fetchMovies();
    } else {
      searchTimeout.current = setTimeout(() => {
        fetchMovies();
      }, 500);
    }

    return () => clearTimeout(searchTimeout.current);
  }, [searchMovie, selectedGenre, activeTab, fetchMovies]);

  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      return;
    }
    setSelectedGenre(genreId);
  };

  useEffect(() => {
    if (heroMovies.length <= 1 || searchMovie.trim().length > 0) return;
    const interval = setInterval(() => {
      setHeroLoaded(false);
      setHeroIndex(prev => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroMovies, searchMovie]);

  // Preload next hero backdrop after initial page paint to save bandwidth
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setTimeout(() => {
      const nextIdx = (heroIndex + 1) % heroMovies.length;
      const nextMovie = heroMovies[nextIdx];
      const nextBackdrop = nextMovie?.backdrop_path
        ? getBackdropUrl(nextMovie.backdrop_path, "w1280")
        : nextMovie?.poster_path
        ? getPosterUrl(nextMovie.poster_path, "w780")
        : null;
      if (nextBackdrop) {
        const img = new Image();
        img.src = nextBackdrop;
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [heroIndex, heroMovies]);

  const heroMovie = heroMovies[heroIndex] || null;

  const backdrop = heroMovie?.backdrop_path
    ? getBackdropUrl(heroMovie.backdrop_path, "w1280")
    : heroMovie?.poster_path
    ? getPosterUrl(heroMovie.poster_path, "w780")
    : null;

  const heroPoster = heroMovie?.poster_path
    ? getPosterUrl(heroMovie.poster_path, "w500")
    : null;

  const isSearching = searchMovie.trim().length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar
        favorites={favorites}
        searchValue={searchMovie}
        onSearchChange={(e) => setSearchMovie(e.target.value)}
        onSearchSubmit={(e) => e.preventDefault()}
      />

      <div className="page-enter" style={{ width: "100%" }}>


      {!isSearching && heroMovie && (
        <div
          ref={heroRef}
          style={{
            position: "relative",
            height: "75vh",
            minHeight: 520,
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
                opacity: heroLoaded ? 1 : 0.8,
                transition: "opacity 0.8s ease, transform 6s ease",
                transform: heroLoaded ? "scale(1.02)" : "scale(1.05)",
              }}
            >
              <img
                src={backdrop}
                alt=""
                style={{ display: "none" }}
                onLoad={() => setHeroLoaded(true)}
              />
            </div>
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--overlay-hero-gradient)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--overlay-hero-gradient-bot)",
            }}
          />

          <div
            className="animate-slide-left"
            style={{
              position: "absolute",
              bottom: "12%",
              left: "5%",
              right: "5%",
              maxWidth: 960,
              display: "flex",
              alignItems: "center",
              gap: 24,
              zIndex: 20,
            }}
          >
            {heroPoster && (
              <div
                className="hidden sm:block shrink-0 relative group"
                style={{
                  width: "clamp(120px, 14vw, 185px)",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  background: "var(--bg-secondary)",
                }}
                onClick={() => {
                  const isTV = Boolean(heroMovie.name || heroMovie.first_air_date || heroMovie.media_type === "tv");
                  navigate(isTV ? `/tv/${heroMovie.id}` : `/movie/${heroMovie.id}`);
                }}
              >
                <img
                  src={heroPoster}
                  alt={heroMovie.title || heroMovie.name}
                  style={{
                    width: "100%",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.4s ease",
                    imageRendering: "-webkit-optimize-contrast",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 6,
                    padding: "2px 6px",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--accent-gold)",
                    letterSpacing: 0.5,
                  }}
                >
                  HD
                </div>
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--accent-red)",
                  color: "white",
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 14,
                  boxShadow: "var(--shadow-glow-red)",
                }}
              >
                <i className="ri-fire-fill" />
                Featured
              </div>

              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(26px, 4.5vw, 48px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                  marginBottom: 12,
                  textShadow: "0 4px 30px var(--glass-bg-nav)",
                  color: "var(--text-primary)",
                }}
              >
                {heroMovie.title || heroMovie.name}
              </h1>

              {heroMovie.overview && (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    marginBottom: 22,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: 580,
                  }}
                >
                  {heroMovie.overview}
                </p>
              )}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  onClick={() => {
                    const isTV = Boolean(heroMovie.name || heroMovie.first_air_date || heroMovie.media_type === "tv");
                    navigate(isTV ? `/tv/${heroMovie.id}` : `/movie/${heroMovie.id}`, {
                      state: { tab: "stream" }
                    });
                  }}
                  className="btn-primary"
                >
                  <i className="ri-play-circle-fill" style={{ fontSize: 20 }} />
                  Watch Now
                </button>
                <button
                  onClick={() => addToFavorite(heroMovie)}
                  className="btn-secondary"
                >
                  <i className={`ri-heart-${favorites.some(f => f.id === heroMovie.id) ? "fill" : "line"}`} />
                  {favorites.some(f => f.id === heroMovie.id) ? "Favorited" : "Add to List"}
                </button>

                {heroMovie.vote_average && (
                  <span
                    className="rating-badge"
                    style={{ marginLeft: 8 }}
                  >
                    <i className="ri-star-fill" style={{ fontSize: 12 }} />
                    {heroMovie.vote_average.toFixed(1)} / 10
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Featured Carousel Thumbnails */}
          {heroMovies.length > 1 && (
            <div
              className="hidden lg:flex items-center gap-2.5 absolute bottom-8 right-8 z-30"
              style={{
                background: "rgba(10, 10, 18, 0.65)",
                padding: "8px 12px",
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              {heroMovies.map((m, idx) => {
                const thumb = getPosterUrl(m.poster_path, "w185");
                const isActive = idx === heroIndex;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setHeroLoaded(false);
                      setHeroIndex(idx);
                    }}
                    style={{
                      width: isActive ? 46 : 34,
                      height: isActive ? 69 : 51,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: isActive ? "2px solid var(--accent-red)" : "1px solid rgba(255,255,255,0.15)",
                      boxShadow: isActive ? "0 0 16px rgba(229,9,20,0.7)" : "none",
                      opacity: isActive ? 1 : 0.6,
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      padding: 0,
                      background: "#111",
                      flexShrink: 0,
                    }}
                    title={m.title || m.name}
                  >
                    <img
                      src={thumb}
                      alt={m.title || m.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div
        className="px-[10px] lg:px-8 pb-10"
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          paddingTop: (isSearching || !heroMovie) ? "87px" : "32px",
        }}
      >

        {!isSearching ? (
          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`genre-tab ${activeTab === tab.id ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {genres.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 20,
                  marginBottom: 8,
                }}
              >
                {genres.slice(0, 15).map((g) => (
                  <button
                    key={g.id}
                    className="filter-pill"
                    onClick={() => handleGenreClick(g.id)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      border: `1px solid ${selectedGenre === g.id ? "rgba(139,92,246,0.6)" : "var(--glass-border-light)"}`,
                      background: selectedGenre === g.id ? "rgba(139,92,246,0.2)" : "var(--glass-bg-nav)",
                      color: selectedGenre === g.id ? "var(--accent-purple)" : "var(--text-muted)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2 className="section-title">
                {selectedGenre
                  ? genres.find(g => g.id === selectedGenre)?.name + " Movies"
                  : TABS.find(t => t.id === activeTab)?.label.replace(/^[^\s]+\s/, "")}
              </h2>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {movies.length} titles
              </span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            <h2 className="section-title">
              Search results for{" "}
              <span style={{ color: "var(--accent-red)" }}>"{searchMovie}"</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
              {loading ? "Searching..." : `${movies.length} results found`}
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 16px",
              gap: 16,
              textAlign: "center",
            }}
          >
            <i
              className="ri-wifi-off-line"
              style={{ fontSize: 56, color: "var(--text-muted)" }}
            />
            <p style={{ color: "var(--text-secondary)", fontSize: 18, fontWeight: 600 }}>
              {error}
            </p>
            <button
              onClick={() => fetchMovies(1, null, null, activeTab)}
              className="btn-primary"
            >
              <i className="ri-refresh-line" />
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="movies-grid">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden" }}>
                <div
                  className="skeleton"
                  style={{ width: "100%", aspectRatio: "2/3" }}
                />
                <div style={{ padding: "12px 14px", background: "var(--bg-card)" }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {movies.length === 0 ? (
              <div
                className="animate-fade-in"
                style={{
                  textAlign: "center",
                  padding: "100px 16px",
                  color: "var(--text-muted)",
                }}
              >
                <i className="ri-search-eye-line" style={{ fontSize: 64, display: "block", marginBottom: 16 }} />
                <p style={{ fontSize: 18, fontWeight: 600 }}>No results found</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>Try a different keyword or category</p>
              </div>
            ) : (
              <div className="movies-grid">
                {movies.map((movie, i) => (
                  <div key={movie.id}>
                    <MovieCard
                      movie={movie}
                      index={i}
                      onFavorite={addToFavorite}
                      isFavorite={favorites.some((fav) => fav.id === movie.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DEDICATED UPCOMING MOVIES SECTION */}
        {!isSearching && activeTab !== "upcoming" && upcomingList.length > 0 && (
          <section
            style={{
              marginTop: 48,
              marginBottom: 20,
              padding: "32px 24px",
              background: "linear-gradient(180deg, rgba(22, 22, 38, 0.75) 0%, rgba(13, 13, 24, 0.95) 100%)",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient background glow */}
            <div
              style={{
                position: "absolute",
                top: "-60px",
                right: "10%",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-60px",
                left: "5%",
                width: 250,
                height: 250,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(229, 9, 20, 0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 24,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "linear-gradient(135deg, rgba(229,9,20,0.2), rgba(139,92,246,0.2))",
                      border: "1px solid rgba(229,9,20,0.4)",
                      color: "#ff6b6b",
                      padding: "4px 12px",
                      borderRadius: 50,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    <i className="ri-calendar-event-fill" /> Coming Soon
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.5px",
                    margin: 0,
                  }}
                >
                  Upcoming Theatrical & OTT Releases
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, margin: 0 }}>
                  Anticipated blockbusters and releases arriving in theaters and streaming soon
                </p>
              </div>

              {/* Carousel controls & View All */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => {
                    setActiveTab("upcoming");
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }}
                  className="filter-pill"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                >
                  View All ({upcomingList.length})
                  <i className="ri-arrow-right-line" />
                </button>

                <button
                  onClick={() => {
                    if (upcomingScrollRef.current) {
                      upcomingScrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
                    }
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(229, 9, 20, 0.8)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
                  title="Scroll Left"
                >
                  <i className="ri-arrow-left-s-line" style={{ fontSize: 20 }} />
                </button>

                <button
                  onClick={() => {
                    if (upcomingScrollRef.current) {
                      upcomingScrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
                    }
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(229, 9, 20, 0.8)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
                  title="Scroll Right"
                >
                  <i className="ri-arrow-right-s-line" style={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            {/* Horizontal Carousel */}
            <div
              ref={upcomingScrollRef}
              style={{
                display: "flex",
                gap: 16,
                overflowX: "auto",
                paddingBottom: 8,
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                position: "relative",
                zIndex: 2,
              }}
            >
              {upcomingList.map((movie, idx) => (
                <div
                  key={movie.id}
                  style={{
                    flex: "0 0 clamp(160px, 18vw, 210px)",
                    scrollSnapAlign: "start",
                  }}
                >
                  <MovieCard
                    movie={movie}
                    index={idx + 10}
                    onFavorite={addToFavorite}
                    isFavorite={favorites.some((fav) => fav.id === movie.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      </div>
    </div>
  );
};

export default Home;
