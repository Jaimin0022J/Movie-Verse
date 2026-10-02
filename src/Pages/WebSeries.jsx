import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../Components/MovieCard";
import Navbar from "../Components/Navbar";
import {
  getPopularTV,
  getTrendingTV,
  getTopRatedTV,
  getOnTheAirTV,
  searchTV,
  searchMulti,
  getTVGenres,
  getTVSeriesByGenre,
  getBackdropUrl,
  getPosterUrl,
  getLatestTV,
  getBollywoodTV,
  getIndianRealityAndTalkShows,
  getAnimeTV,
} from "../Api/Api";

const TABS = [
  { id: "latest",     label: "🆕 Latest",                 icon: "ri-calendar-check-fill" },
  { id: "reality_tv", label: "🎙️ Reality & Comedy Shows",  icon: "ri-mic-fill" },
  { id: "trending",   label: "🔥 Trending",               icon: "ri-fire-fill" },
  { id: "popular",    label: "🎬 Popular",                icon: "ri-film-fill" },
  { id: "top_rated",  label: "⭐ Top Rated",             icon: "ri-award-fill" },
  { id: "on_the_air", label: "📺 On The Air",            icon: "ri-broadcast-line" },
  { id: "bollywood",  label: "🇮🇳 Bollywood",             icon: "ri-map-pin-2-fill" },
  { id: "anime",      label: "🌸 Anime",                 icon: "ri-play-circle-fill" },
];

const WebSeries = ({ addToFavorite, favorites = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [series, setSeries] = useState([]);
  const [heroSeries, setHeroSeries] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchTimeout = useRef(null);

  useEffect(() => {
    getTVGenres()
      .then(setGenres)
      .catch(() => {});
  }, []);


  const fetchData = useCallback(async (pageNum = 1, forceSearch = null, forceGenre = null, forceTab = null) => {
    const activeSearch = forceSearch !== null ? forceSearch : searchQuery;
    const activeGen = forceGenre !== null ? forceGenre : selectedGenre;
    const activeT = forceTab !== null ? forceTab : activeTab;

    if (pageNum === 1) setLoading(true);
    else setFetchingMore(true);
    setError(null);

    try {
      let rawResults;
      if (activeSearch.trim()) {
        rawResults = await searchMulti(activeSearch, pageNum);
      } else if (activeGen) {
        rawResults = await getTVSeriesByGenre(activeGen, pageNum);
      } else {
        if (activeT === "reality_tv")    rawResults = await getIndianRealityAndTalkShows(pageNum);
        else if (activeT === "trending")      rawResults = await getTrendingTV("week", pageNum);
        else if (activeT === "popular")  rawResults = await getPopularTV(pageNum);
        else if (activeT === "top_rated") rawResults = await getTopRatedTV(pageNum);
        else if (activeT === "on_the_air")rawResults = await getOnTheAirTV(pageNum);
        else if (activeT === "latest")   rawResults = await getLatestTV(pageNum);
        else if (activeT === "bollywood") rawResults = await getBollywoodTV(pageNum);
        else if (activeT === "anime")     rawResults = await getAnimeTV(pageNum);
        else rawResults = await getPopularTV(pageNum);
      }

      // Filter out items without posters and exclude unreleased shows
      const today = new Date().toISOString().split("T")[0];
      const validResults = rawResults.filter(item => {
        if (!item.poster_path) return false;
        const rDate = item.first_air_date || item.release_date;
        if (rDate && rDate > today) return false;
        return true;
      });

      setSeries(prev => pageNum === 1 ? validResults : [...prev, ...validResults]);
      setHasMore(rawResults.length > 0);

      if (pageNum === 1 && validResults.length > 0) {
        const validHero = validResults.filter(m => m.backdrop_path);
        setHeroSeries(validHero.length > 0 ? validHero.slice(0, 5) : validResults.slice(0, 5));
        setHeroIndex(0);
      } else if (pageNum === 1) {
        setHeroSeries([]);
      }
    } catch {
      setError("Failed to load web series. Check your connection.");
    } finally {
      if (pageNum === 1) setLoading(false);
      else setFetchingMore(false);
    }
  }, [searchQuery, selectedGenre, activeTab]);

  useEffect(() => {
    if (page === 1) {
      clearTimeout(searchTimeout.current);
      
      if (!searchQuery.trim()) {
        fetchData(1, "", selectedGenre, activeTab);
      } else {
        searchTimeout.current = setTimeout(() => {
          fetchData(1, searchQuery, selectedGenre, activeTab);
        }, 500);
      }
    }

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery, selectedGenre, activeTab, fetchData, page]);

  useEffect(() => {
    if (page > 1) {
      fetchData(page);
    }
  }, [page, fetchData]);

  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      setPage(1);
      return;
    }
    setSelectedGenre(genreId);
    setPage(1);
  };

  useEffect(() => {
    if (heroSeries.length <= 1 || searchQuery.trim().length > 0) return;
    const interval = setInterval(() => {
      setHeroLoaded(false);
      setHeroIndex(prev => (prev + 1) % heroSeries.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSeries, searchQuery]);

  // Preload next hero backdrop after initial page paint to save bandwidth
  useEffect(() => {
    if (heroSeries.length <= 1) return;
    const timer = setTimeout(() => {
      const nextIdx = (heroIndex + 1) % heroSeries.length;
      const nextItem = heroSeries[nextIdx];
      const nextBackdrop = nextItem?.backdrop_path
        ? getBackdropUrl(nextItem.backdrop_path, "w1280")
        : nextItem?.poster_path
        ? getPosterUrl(nextItem.poster_path, "w780")
        : null;
      if (nextBackdrop) {
        const img = new Image();
        img.src = nextBackdrop;
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [heroIndex, heroSeries]);

  const heroItem = heroSeries[heroIndex] || null;
  const backdrop = heroItem?.backdrop_path
    ? getBackdropUrl(heroItem.backdrop_path, "w1280")
    : heroItem?.poster_path
    ? getPosterUrl(heroItem.poster_path, "w780")
    : null;

  const heroPoster = heroItem?.poster_path
    ? getPosterUrl(heroItem.poster_path, "w500")
    : null;

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar
        favorites={favorites}
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSearchSubmit={(e) => e.preventDefault()}
      />

      <div className="page-enter" style={{ width: "100%" }}>

        {!isSearching && heroItem && (
          <div style={{ position: "relative", height: "75vh", minHeight: 520, overflow: "hidden" }}>
            {backdrop && (
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${backdrop})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                opacity: heroLoaded ? 1 : 0.8,
                transition: "opacity 0.8s ease, transform 6s ease",
                transform: heroLoaded ? "scale(1.02)" : "scale(1.05)",
              }}>
                <img src={backdrop} alt="" style={{ display: "none" }} onLoad={() => setHeroLoaded(true)} />
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "var(--overlay-hero-gradient)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--overlay-hero-gradient-bot)" }} />

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
                  onClick={() => navigate(`/tv/${heroItem.id}`)}
                >
                  <img
                    src={heroPoster}
                    alt={heroItem.name}
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
                      color: "var(--accent-purple)",
                      letterSpacing: 0.5,
                    }}
                  >
                    HD
                  </div>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--accent-purple)",
                  color: "white",
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 14,
                  boxShadow: "var(--shadow-glow-purple)",
                }}>
                  <i className="ri-tv-line" />
                  Featured Series
                </div>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(26px, 4.5vw, 48px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                  marginBottom: 12,
                  color: "var(--text-primary)",
                }}>
                  {heroItem.name}
                </h1>
                {heroItem.overview && (
                  <p style={{
                    color: "var(--text-secondary)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    marginBottom: 22,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: 580,
                  }}>
                    {heroItem.overview}
                  </p>
                )}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => navigate(`/tv/${heroItem.id}`, { state: { tab: "stream" } })} className="btn-primary" style={{ background: "var(--accent-purple)", boxShadow: "0 8px 25px rgba(139, 92, 246, 0.35)" }}>
                    <i className="ri-play-circle-fill" style={{ fontSize: 20 }} />
                    Watch Now
                  </button>
                  <button onClick={() => addToFavorite(heroItem)} className="btn-secondary">
                    <i className={`ri-heart-${favorites.some(f => f.id === heroItem.id) ? "fill" : "line"}`} />
                    {favorites.some(f => f.id === heroItem.id) ? "Favorited" : "Add to List"}
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Series Carousel Thumbnails */}
            {heroSeries.length > 1 && (
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
                {heroSeries.map((s, idx) => {
                  const thumb = getPosterUrl(s.poster_path, "w185");
                  const isActive = idx === heroIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setHeroLoaded(false);
                        setHeroIndex(idx);
                      }}
                      style={{
                        width: isActive ? 46 : 34,
                        height: isActive ? 69 : 51,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: isActive ? "2px solid var(--accent-purple)" : "1px solid rgba(255,255,255,0.15)",
                        boxShadow: isActive ? "0 0 16px rgba(139,92,246,0.7)" : "none",
                        opacity: isActive ? 1 : 0.6,
                        transform: isActive ? "scale(1.05)" : "scale(1)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: 0,
                        background: "#111",
                        flexShrink: 0,
                      }}
                      title={s.name}
                    >
                      <img
                        src={thumb}
                        alt={s.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={(isSearching || !heroItem) ? "pt-[100px] px-[10px] lg:px-8 pb-10" : "pt-8 px-[10px] lg:px-8 pb-10"} style={{ maxWidth: 1600, margin: "0 auto" }}>
          {!isSearching ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
                {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`genre-tab ${activeTab === tab.id ? "active" : ""}`} style={activeTab === tab.id ? { background: "var(--accent-purple)", borderColor: "var(--accent-purple)", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)" } : {}}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {genres.length > 0 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 20, marginBottom: 8 }}>
                  {genres.slice(0, 15).map((g) => (
                    <button key={g.id} className="filter-pill" onClick={() => handleGenreClick(g.id)} style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      border: `1px solid ${selectedGenre === g.id ? "rgba(139,92,246,0.6)" : "var(--glass-border-light)"}`,
                      background: selectedGenre === g.id ? "rgba(139,92,246,0.2)" : "var(--glass-bg-nav)",
                      color: selectedGenre === g.id ? "var(--accent-purple)" : "var(--text-muted)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}>
                      {g.name}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 className="section-title">
                  {selectedGenre ? genres.find(g => g.id === selectedGenre)?.name + " Series" : TABS.find(t => t.id === activeTab)?.label.replace(/^[^\s]+\s/, "")}
                </h2>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{series.length} titles</span>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <h2 className="section-title">Search results for <span style={{ color: "var(--accent-purple)" }}>"{searchQuery}"</span></h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>{loading ? "Searching..." : `${series.length} results found`}</p>
            </div>
          )}

          {error && !loading && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", gap: 16, textAlign: "center" }}>
              <i className="ri-wifi-off-line" style={{ fontSize: 56, color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: 18, fontWeight: 600 }}>{error}</p>
              <button onClick={() => fetchData(1)} className="btn-primary" style={{ background: "var(--accent-purple)" }}>
                <i className="ri-refresh-line" /> Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="movies-grid">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden" }}>
                  <div className="skeleton" style={{ width: "100%", aspectRatio: "2/3" }} />
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
              {series.length === 0 ? (
                <div className="animate-fade-in" style={{ textAlign: "center", padding: "100px 16px", color: "var(--text-muted)" }}>
                  <i className="ri-search-eye-line" style={{ fontSize: 64, display: "block", marginBottom: 16 }} />
                  <p style={{ fontSize: 18, fontWeight: 600 }}>No series found</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {series.map((item, i) => (
                    <div key={item.id}>
                      <MovieCard
                        movie={item}
                        index={i}
                        onFavorite={addToFavorite}
                        isFavorite={favorites.some((fav) => fav.id === item.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSeries;