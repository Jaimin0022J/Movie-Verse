import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../Components/MovieCard";
import Navbar from "../Components/Navbar";
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getNowPlaying,
  searchMovies,
  getGenres,
  getMoviesByGenre,
  getBackdropUrl,
  getBollywoodMovies,
  getLatestMovies,
  getLatestTV,
} from "../Api/Api";

const TABS = [
  { id: "latest",   label: "🆕 Latest",       icon: "ri-calendar-check-fill" },
  { id: "trending",  label: "🔥 Trending",   icon: "ri-fire-fill" },
  { id: "popular",   label: "🎬 Popular",     icon: "ri-film-fill" },
  { id: "top_rated", label: "⭐ Top Rated",    icon: "ri-award-fill" },
  { id: "now",       label: "🎭 Now Playing",  icon: "ri-live-fill" },
  { id: "bollywood", label: "🇮🇳 Bollywood",   icon: "ri-map-pin-2-fill" },
];

const Home = ({ addToFavorite, favorites }) => {
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

  const searchTimeout = useRef(null);
  const heroRef = useRef(null);



  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {});
  }, []);


  const fetchMovies = useCallback(async (forceSearch = null, forceGenre = null, forceTab = null) => {
    const activeSearch = forceSearch !== null ? forceSearch : searchMovie;
    const activeGen = forceGenre !== null ? forceGenre : selectedGenre;
    const activeT = forceTab !== null ? forceTab : activeTab;

    setLoading(true);
    setError(null);

    try {
      const getResults = async (p) => {
        if (activeSearch.trim()) return await searchMovies(activeSearch, p);
        if (activeGen) return await getMoviesByGenre(activeGen, p);
        if (activeT === "trending")  return await getTrendingMovies("week", p);
        if (activeT === "popular")   return await getPopularMovies(p);
        if (activeT === "top_rated") return await getTopRatedMovies(p);
        if (activeT === "now")       return await getNowPlaying(p);
        if (activeT === "bollywood") return await getBollywoodMovies(p);
        if (activeT === "latest")    return await getLatestMovies(p);
        return await getPopularMovies(p);
      };

      // Fetch two pages to ensure we have at least 25 movies (TMDB returns 20 per page)
      const [page1, page2] = await Promise.all([getResults(1), getResults(2)]);
      const combinedResults = [...page1, ...page2].slice(0, 25);

      setMovies(combinedResults);

      if (combinedResults.length > 0) {
        setHeroMovies(combinedResults.slice(0, 5));
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

    const resetAndFetch = () => {
      fetchMovies(searchMovie, selectedGenre, activeTab);
    };

    if (!searchMovie.trim()) {
      resetAndFetch();
      return;
    }

    searchTimeout.current = setTimeout(() => {
      resetAndFetch();
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchMovie, fetchMovies, selectedGenre, activeTab]);

  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      fetchMovies(searchMovie, null, activeTab);
      return;
    }
    setSelectedGenre(genreId);
    fetchMovies(searchMovie, genreId, activeTab);
  };

  useEffect(() => {
    if (heroMovies.length <= 1 || searchMovie.trim().length > 0) return;
    const interval = setInterval(() => {
      setHeroLoaded(false);
      setHeroIndex(prev => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroMovies, searchMovie]);

  const heroMovie = heroMovies[heroIndex] || null;

  const backdrop = heroMovie?.backdrop_path
    ? getBackdropUrl(heroMovie.backdrop_path)
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
            minHeight: 500,
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
                opacity: heroLoaded ? 1 : 0,
                transition: "opacity 1.2s ease",
                transform: "scale(1.04)",
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
              bottom: "15%",
              left: "5%",
              right: "5%",
              maxWidth: 600,
            }}
          >
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
                marginBottom: 16,
                boxShadow: "var(--shadow-glow-red)",
              }}
            >
              <i className="ri-fire-fill" />
              Featured
            </div>

            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(28px, 5vw, 52px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1px",
                marginBottom: 16,
                textShadow: "0 4px 30px var(--glass-bg-nav)",
                color: "var(--text-primary)",
              }}
            >
              {heroMovie.title}
            </h1>

            {heroMovie.overview && (
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 28,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {heroMovie.overview}
              </p>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => navigate(`/movie/${heroMovie.id}`)}
                className="btn-primary"
              >
                <i className="ri-information-line" style={{ fontSize: 18 }} />
                View Details
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
      </div>
      </div>
    </div>
  );
};

export default Home;
