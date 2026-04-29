const API_KEY = "435cfbd8a60ad630664daddfec1e546e";
const BASE_URL = "https://api.themoviedb.org/3";

const apiCache = new Map();

async function proxyFetch(url) {
  if (apiCache.has(url)) {
    return apiCache.get(url).clone();
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");
  
  apiCache.set(url, res.clone());
  return res;
}

async function handleResponse(res) {
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  if (data.success === false) throw new Error(data.status_message || "API error");
  return data;
}

export async function getPopularMovies(page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getTrendingMovies(timeWindow = "week", page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getTopRatedMovies(page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getNowPlaying(page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getUpcomingMovies() {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`)
  );
  return data.results;
}

export async function searchMovies(query, page = 1) {
  if (!query) return [];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    )
  );
  return data.results;
}

export async function getMovieDetails(id) {
  const res = await proxyFetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,similar,external_ids`
  );
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  if (data.success === false || data.status_code) {
    throw new Error(data.status_message || "Movie not found");
  }
  return data;
}

export async function getMovieVideos(id) {
  try {
    const res = await proxyFetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function getMovieWatchProviders(id) {
  try {
    const res = await proxyFetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results || {};
  } catch {
    return null;
  }
}

export async function getMoviesByGenre(genreId, page = 1) {
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    )
  );
  return data.results;
}

export async function getBollywoodMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=5&page=${page}`
    )
  );
  return data.results;
}

export async function getLatestMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=10&page=${page}`
    )
  );
  return data.results;
}

export async function getGenres() {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
  );
  return data.genres || [];
}

// --- TV SERIES (WEB SERIES) API ---

export async function getPopularTV(page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getTrendingTV(timeWindow = "week", page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/trending/tv/${timeWindow}?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getTopRatedTV(page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function getOnTheAirTV(page = 1) {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&page=${page}`)
  );
  return data.results;
}

export async function searchTV(query, page = 1) {
  if (!query) return [];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    )
  );
  return data.results;
}

export async function getTVDetails(id) {
  const res = await proxyFetch(
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,similar,recommendations,external_ids`
  );
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  if (data.success === false || data.status_code) {
    throw new Error(data.status_message || "TV Series not found");
  }
  return data;
}

export async function getTVVideos(id) {
  try {
    const res = await proxyFetch(`${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function getTVWatchProviders(id) {
  try {
    const res = await proxyFetch(`${BASE_URL}/tv/${id}/watch/providers?api_key=${API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results || {};
  } catch {
    return null;
  }
}

export async function getTVGenres() {
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`)
  );
  return data.genres || [];
}

export async function getTVSeriesByGenre(genreId, page = 1) {
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    )
  );
  return data.results;
}

export async function getLatestTV(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=first_air_date.desc&first_air_date.lte=${today}&vote_count.gte=10&page=${page}`
    )
  );
  return data.results;
}

export async function getBollywoodTV(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=hi&sort_by=first_air_date.desc&first_air_date.lte=${today}&vote_count.gte=5&page=${page}`
    )
  );
  return data.results;
}

export async function getTVSeasonDetails(id, seasonNumber) {
  const res = await proxyFetch(
    `${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export const IMAGE_BASE = "https://image.tmdb.org/t/p";
export const getPosterUrl  = (path, size = "w342")   => path ? `${IMAGE_BASE}/${size}${path}` : null;
export const getBackdropUrl = (path, size = "w300") => path ? `${IMAGE_BASE}/${size}${path}` : null;
