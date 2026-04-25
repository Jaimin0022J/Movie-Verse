import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Favorite from "./Pages/Favorite";
import Moviepage from "./Pages/Moviepage";
import WebSeries from "./Pages/WebSeries";
import "./index.css";

const App = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("movieverse_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("movieverse_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorite = (movie) => {
    setFavorites((prev) =>
      prev.find((fav) => fav.id === movie.id) ? prev : [...prev, movie]
    );
  };

  const removeFromFavorite = (id) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== id));
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Home addToFavorite={addToFavorite} favorites={favorites} />}
      />
      <Route
        path="/favorite"
        element={
          <Favorite favorites={favorites} removeFromFavorite={removeFromFavorite} />
        }
      />
      <Route path="/movie/:id" element={<Moviepage key={window.location.pathname} />} />
      <Route path="/tv/:id" element={<Moviepage key={window.location.pathname} />} />
      <Route
        path="/web-series"
        element={
          <WebSeries addToFavorite={addToFavorite} favorites={favorites} />
        }
      />
    </Routes>
  );
};

export default App;
