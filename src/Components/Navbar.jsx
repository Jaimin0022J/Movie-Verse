import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";

const Navbar = ({
  favorites = [],
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(e);
  };

  const isHome = location.pathname === "/";
  const isWebSeries = location.pathname === "/web-series";
  const isFavorite = location.pathname === "/favorite";
  
  const accentColor = isWebSeries ? "var(--accent-purple)" : "var(--accent-red)";
  const accentGlow = isWebSeries ? "rgba(139, 92, 246, 0.15)" : "rgba(229, 9, 20, 0.15)";

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        style={{
          background: scrolled ? "var(--nav-scrolled)" : "var(--nav-backdrop)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 1600,
            margin: "0 auto",
          }}
        >

          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: "var(--accent-red)",
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(229,9,20,0.4)",
              }}
            >
              <i
                className="ri-film-fill"
                style={{ color: "white", fontSize: 20 }}
              />
            </div>
            <span
              className="logo-text-desktop"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: "-0.8px",
                color: "var(--text-primary)",
              }}
            >
              Movie<span style={{ color: "var(--accent-red)" }}>Verse</span>
            </span>
          </Link>

          <div style={{ flex: 1 }} />

          {(isHome || isWebSeries) && (
            <form
              onSubmit={handleFormSubmit}
              className={`search-form ${searchOpen || searchValue ? "active" : ""}`}
              style={{
                border: searchOpen || searchValue ? `1px solid ${accentColor}` : "1px solid var(--glass-border)",
                boxShadow: searchOpen || searchValue ? `0 0 0 3px ${accentGlow}` : "none",
                boxSizing: "border-box",
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setSearchOpen(false);
                }
              }}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
              }}
            >
              <button
                type="submit"
                className="flex items-center justify-center shrink-0"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: 0,
                  fontSize: 20,
                  width: 20,
                  height: 20,
                  transition: "color 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = accentColor;
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <i className="ri-search-line" />
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder={isWebSeries ? "Search web series..." : "Search movies..."}
                value={searchValue}
                onChange={onSearchChange}
                className="search-input"
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  width: searchOpen || searchValue ? "100%" : "0px",
                  opacity: searchOpen || searchValue ? 1 : 0,
                  padding: 0,
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange({ target: { value: "" } })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    fontSize: 16,
                    padding: 0,
                    transition: "color 0.2s ease, transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = accentColor;
                    e.currentTarget.style.transform = "scale(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <i className="ri-close-line" />
                </button>
              )}
            </form>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: 16,
            }}
          >
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--glass-bg-nav)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginRight: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--glass-bg-nav-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--glass-bg-nav)";
              }}
            >
              <i
                className={theme === "dark" ? "ri-sun-fill" : "ri-moon-fill"}
                style={{ fontSize: 18 }}
              />
            </button>

            {!isHome && (
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 50,
                  background: "var(--glass-bg-nav)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--glass-bg-nav-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--glass-bg-nav)";
                }}
              >
                <i className="ri-home-4-fill" />
                <span className="nav-actions-text">Home</span>
              </Link>
            )}

            <Link
              to="/web-series"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 50,
                background: location.pathname === "/web-series"
                  ? "var(--accent-purple)"
                  : "var(--glass-bg-nav)",
                border: `1px solid ${location.pathname === "/web-series" ? "var(--accent-purple)" : "var(--glass-border)"}`,
                color: location.pathname === "/web-series" ? "#ffffff" : "var(--text-primary)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.25s ease",
                boxShadow: location.pathname === "/web-series" ? "0 4px 15px rgba(139,92,246,0.4)" : "none",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== "/web-series")
                  e.currentTarget.style.background = "rgba(139,92,246,0.15)";
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/web-series")
                  e.currentTarget.style.background = "var(--glass-bg-nav)";
              }}
            >
              <i className="ri-tv-line" />
              <span className="nav-actions-text">Web Series</span>
            </Link>

            <Link
              to="/favorite"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 50,
                background: isFavorite
                  ? "var(--accent-red)"
                  : "var(--glass-bg-nav)",
                border: `1px solid ${isFavorite ? "var(--accent-red)" : "var(--glass-border)"}`,
                color: isFavorite ? "#ffffff" : "var(--text-primary)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.25s ease",
                boxShadow: isFavorite ? "0 4px 15px rgba(229,9,20,0.4)" : "none",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isFavorite)
                  e.currentTarget.style.background = "rgba(229,9,20,0.15)";
              }}
              onMouseLeave={(e) => {
                if (!isFavorite)
                  e.currentTarget.style.background = "var(--glass-bg-nav)";
              }}
            >
              <i className="ri-heart-fill" />
              <span className="nav-actions-text">Favorites</span>
              {favorites.length > 0 && (
                <span
                  style={{
                    background: isFavorite ? "white" : "var(--accent-red)",
                    color: isFavorite ? "var(--accent-red)" : "white",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    marginLeft: 2,
                  }}
                >
                  {favorites.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
