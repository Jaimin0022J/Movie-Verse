import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosterUrl } from "../Api/Api";

export default function MovieCard({ movie, onFavorite, isFavorite, onRemove, index = 0 }) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [heartRing, setHeartRing] = useState(false);

  const poster = getPosterUrl(movie.poster_path) || "https://placehold.co/500x750/1a1a27/5a5a70?text=No+Image";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  
  // Handle both Movie (title, release_date) and TV (name, first_air_date)
  const title = movie.title || movie.name || "Untitled";
  const rawDate = movie.release_date || movie.first_air_date || "";
  const year = rawDate.split("-")[0] || "";
  
  // Decide media type for navigation
  const isTV = !!movie.name || movie.first_air_date !== undefined || movie.media_type === "tv";
  const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setHeartRing(true);
    setTimeout(() => setHeartRing(false), 600);
    if (isFavorite) {
      onRemove?.(movie.id);
    } else {
      onFavorite?.(movie);
    }
  };

  const delayStyle = { animationDelay: `${index * 60}ms`, opacity: 0 };

  return (
    <div
      className="movie-card animate-card-enter"
      style={delayStyle}
      onClick={() => navigate(detailPath)}
    >

      <div style={{ position: "relative", overflow: "hidden", background: "var(--bg-secondary)" }}>
        {!imgLoaded && (
          <div
            className="skeleton"
            style={{ width: "100%", aspectRatio: "2/3" }}
          />
        )}
        <img
          src={poster}
          alt={title}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            aspectRatio: "2/3",
            objectFit: "cover",
            display: imgLoaded ? "block" : "none",
            transition: "transform 0.4s ease",
          }}
        />

        <div className="card-overlay">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50px",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                transform: "translateY(20px)",
                opacity: 0,
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              className="view-details-pill"
            >
              <i className="ri-play-circle-fill" style={{ fontSize: 20, color: "var(--accent-red)" }} />
              View Details
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >

          {rating !== "N/A" && (
            <span className="rating-badge">
              <i className="ri-star-fill" style={{ fontSize: 10 }} />
              {rating}
            </span>
          )}

          <button
            onClick={handleFavoriteClick}
            className={`heart-btn ${heartRing ? "ring" : ""}`}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isFavorite
                ? "rgba(229, 9, 20, 0.9)"
                : "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              color: "white",
              fontSize: 16,
              flexShrink: 0,
              marginLeft: "auto",
            }}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <i className={isFavorite ? "ri-heart-fill" : "ri-heart-line"} />
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: "var(--gradient-card)",
          borderTop: "1px solid var(--glass-border-light)",
          minHeight: "75px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text-primary)",
            marginBottom: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            height: "2.8em", // Fixed height for 2 lines
          }}
        >
          {title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 500 }}>{year}</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              color: "var(--accent-gold)",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <i className="ri-star-fill" style={{ fontSize: 10 }} />
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
}