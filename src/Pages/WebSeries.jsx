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
  getTVGenres,
  getTVSeriesByGenre,
  getBackdropUrl,
  getLatestTV,
  getBollywoodTV,
} from "../Api/Api";

const TABS = [
  { id: "latest",   label: "🆕 Latest",       icon: "ri-calendar-check-fill" },
  { id: "trending",  label: "🔥 Trending",   icon: "ri-fire-fill" },
  { id: "popular",   label: "🎬 Popular",     icon: "ri-film-fill" },
  { id: "top_rated", label: "⭐ Top Rated",    icon: "ri-award-fill" },
  { id: "on_the_air",label: "📺 On The Air",  icon: "ri-broadcast-line" },
  { id: "bollywood", label: "🇮🇳 Bollywood",   icon: "ri-map-pin-2-fill" },
];

const WebSeries = ({ addToFavorite, favorites }) => {
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
      let results;
      if (activeSearch.trim()) {
        results = await searchTV(activeSearch, pageNum);
      } else if (activeGen) {
        results = await getTVSeriesByGenre(activeGen, pageNum);
      } else {
        if (activeT === "trending")      results = await getTrendingTV("week", pageNum);
        else if (activeT === "popular")  results = await getPopularTV(pageNum);
        else if (activeT === "top_rated") results = await getTopRatedTV(pageNum);
        else if (activeT === "on_the_air")results = await getOnTheAirTV(pageNum);
        else if (activeT === "latest")   results = await getLatestTV(pageNum);
        else if (activeT === "bollywood") results = await getBollywoodTV(pageNum);
        else results = await getPopularTV(pageNum);
      }

      setSeries(prev => pageNum === 1 ? results : [...prev, ...results]);
      setHasMore(results.length > 0);

      if (pageNum === 1 && results.length > 0) {
        setHeroSeries(results.slice(0, 5));
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

  const heroItem = heroSeries[heroIndex] || null;
  const backdrop = heroItem?.backdrop_path ? getBackdropUrl(heroItem.backdrop_path, "w780") : null;
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
          <div style={{ position: "relative", height: "75vh", minHeight: 500, overflow: "hidden" }}>
            {backdrop && (
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${backdrop})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                opacity: heroLoaded ? 1 : 0,
                transition: "opacity 1.2s ease",
                transform: "scale(1.04)",
              }}>
                <img src={backdrop} alt="" style={{ display: "none" }} onLoad={() => setHeroLoaded(true)} />
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "var(--overlay-hero-gradient)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--overlay-hero-gradient-bot)" }} />

            <div className="animate-slide-left" style={{ position: "absolute", bottom: "15%", left: "5%", right: "5%", maxWidth: 600 }}>
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
                marginBottom: 16,
                boxShadow: "var(--shadow-glow-purple)",
              }}>
                <i className="ri-tv-line" />
                Featured Series
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(28px, 5vw, 52px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1px",
                marginBottom: 16,
                color: "var(--text-primary)",
              }}>
                {heroItem.name}
              </h1>
              {heroItem.overview && (
                <p style={{
                  color: "var(--text-secondary)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 28,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {heroItem.overview}
                </p>
              )}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => navigate(`/tv/${heroItem.id}`)} className="btn-primary" style={{ background: "var(--accent-purple)", boxShadow: "0 8px 25px rgba(139, 92, 246, 0.35)" }}>
                  <i className="ri-information-line" style={{ fontSize: 18 }} />
                  View Details
                </button>
                <button onClick={() => addToFavorite(heroItem)} className="btn-secondary">
                  <i className={`ri-heart-${favorites.some(f => f.id === heroItem.id) ? "fill" : "line"}`} />
                  {favorites.some(f => f.id === heroItem.id) ? "Favorited" : "Add to List"}
                </button>
              </div>
            </div>
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