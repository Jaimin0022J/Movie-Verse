import React from "react";
import { Link } from "react-router-dom";
import MovieCard from "../Components/MovieCard";
import Navbar from "../Components/Navbar";

const Favorite = ({ favorites = [], removeFromFavorite }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar favorites={favorites} />

      <div
        style={{
          width: "100%",
          paddingTop: 60,
          background: "linear-gradient(to bottom, rgba(229,9,20,0.05) 0%, transparent 100%)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 60px" }}>
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: "var(--accent-red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 25px rgba(229,9,20,0.35), 0 0 15px rgba(229,9,20,0.2)",
                marginBottom: 8,
              }}
            >
              <i className="ri-heart-fill" style={{ color: "white", fontSize: 22 }} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(22px, 5vw, 38px)",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  letterSpacing: "-1px",
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                My <span style={{ color: "var(--accent-red)" }}>Favorites</span>
              </h1>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 16,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                {favorites.length > 0
                  ? `You have ${favorites.length} movie${favorites.length > 1 ? "s" : ""} in your collection`
                  : "Your personal movie collection awaits"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="px-[10px] lg:px-8 pb-[60px]"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {favorites.length === 0 ? (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 16px 120px",
              textAlign: "center",
              gap: 24,
            }}
          >
            <div
              className="animate-float"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "var(--bg-card)",
                border: "1px solid var(--glass-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <i
                className="ri-heart-line"
                style={{ color: "var(--accent-red)", fontSize: 56, opacity: 0.4 }}
              />
            </div>

            <div style={{ maxWidth: 400 }}>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: 12,
                }}
              >
                No favorites yet
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                Your favorite movies and shows will appear here. Start exploring and click the{" "}
                <i className="ri-heart-fill" style={{ color: "var(--accent-red)" }} /> icon to save them.
              </p>
            </div>

            <Link
              to="/"
              className="btn-primary"
              style={{ 
                textDecoration: "none", 
                marginTop: 12,
                padding: "14px 32px",
                fontSize: 16
              }}
            >
              <i className="ri-compass-3-fill" />
              Explore MovieVerse
            </Link>
          </div>
        ) : (

          <div className="movies-grid">
            {favorites.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={i}
                isFavorite={true}
                onRemove={removeFromFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorite;