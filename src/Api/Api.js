const API_KEY = "435cfbd8a60ad630664daddfec1e546e";
// Using alternate domain to help bypass ISP blocks (common in India)
const BASE_URL = "https://api.tmdb.org/3";

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
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_date.lte=${today}&page=${page}`
    )
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getTrendingMovies(timeWindow = "week", page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&page=${page}`)
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getTopRatedMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`)
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getNowPlaying(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`)
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getUpcomingMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const [upcomingData, discoverData] = await Promise.all([
      handleResponse(await proxyFetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`)).catch(() => ({ results: [] })),
      handleResponse(await proxyFetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${today}&sort_by=popularity.desc&page=${page}`)).catch(() => ({ results: [] })),
    ]);

    const combined = [...(discoverData.results || []), ...(upcomingData.results || [])];
    const map = new Map();
    combined.forEach((m) => {
      if (m.poster_path && m.release_date && m.release_date > today) {
        map.set(m.id, m);
      }
    });

    return Array.from(map.values()).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } catch {
    return [];
  }
}

export async function searchMovies(query, page = 1) {
  if (!query) return [];
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    )
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function searchMulti(query, page = 1) {
  if (!query) return [];
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    )
  );
  return (data.results || []).filter((item) => {
    if (!item.poster_path) return false;
    if (item.media_type !== "movie" && item.media_type !== "tv") return false;
    const rDate = item.release_date || item.first_air_date;
    if (rDate && rDate > today) return false;
    return true;
  });
}

export async function getMovieDetails(id) {
  const res = await proxyFetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,similar,external_ids,images`
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
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&primary_release_date.lte=${today}&page=${page}`
    )
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getBollywoodMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=5&page=${page}`
    )
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getAnimeMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=5&page=${page}`
    )
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
}

export async function getLatestMovies(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=10&page=${page}`
    )
  );
  return (data.results || []).filter(
    (m) => m.release_date && m.release_date <= today
  );
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
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,similar,recommendations,external_ids,images`
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

const CURATED_REALITY_TV_IDS = [
  262838, // India's Got Latent
  66465,  // The Kapil Sharma Show
  247769, // The Great Indian Kapil Show
  153870, // Shark Tank India
  80813,  // Comicstaan
  14544,  // Koffee with Karan
  8630,   // Taarak Mehta Ka Ooltah Chashmah
  60698,  // Comedy Nights with Kapil
  911,    // Kaun Banega Crorepati
  130780, // Bigg Boss OTT
  8426,   // MTV Roadies
  85518,  // Khatron Ke Khiladi
  13700,  // Indian Idol
  82605,  // Dance Plus
  94537,  // MTV Hustle
  7420,   // MTV Splitsvilla
  33982,  // MasterChef India
  90990,  // Comedy Nights Bachao
  19457,  // India's Got Talent
  85278   // Super Dancer
];

export async function getIndianRealityAndTalkShows(page = 1) {
  if (page === 1) {
    try {
      const curatedPromises = CURATED_REALITY_TV_IDS.map(async (id) => {
        try {
          const res = await proxyFetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
          if (!res.ok) return null;
          const show = await res.json();
          if (!show || !show.id || !show.poster_path) return null;
          return { ...show, media_type: "tv" };
        } catch {
          return null;
        }
      });

      const [curatedList, discoverRes] = await Promise.all([
        Promise.all(curatedPromises),
        proxyFetch(
          `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=hi&with_genres=10764|10767&sort_by=popularity.desc&page=1`
        )
          .then(handleResponse)
          .catch(() => ({ results: [] })),
      ]);

      const validCurated = curatedList.filter(Boolean);
      const curatedIds = new Set(validCurated.map((s) => s.id));
      const discoverResults = (discoverRes.results || [])
        .filter((s) => s.poster_path && !curatedIds.has(s.id))
        .map((s) => ({ ...s, media_type: "tv" }));

      return [...validCurated, ...discoverResults];
    } catch {
      const data = await handleResponse(
        await proxyFetch(
          `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=hi&with_genres=10764|10767&sort_by=popularity.desc&page=1`
        )
      );
      return (data.results || []).map((s) => ({ ...s, media_type: "tv" }));
    }
  }

  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=hi&with_genres=10764|10767&sort_by=popularity.desc&page=${page}`
    )
  );
  const curatedIds = new Set(CURATED_REALITY_TV_IDS);
  return (data.results || [])
    .filter((s) => s.poster_path && !curatedIds.has(s.id))
    .map((s) => ({ ...s, media_type: "tv" }));
}

export const getIndianRealityAndComedyShows = getIndianRealityAndTalkShows;

export async function getAnimeTV(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const data = await handleResponse(
    await proxyFetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=first_air_date.desc&first_air_date.lte=${today}&vote_count.gte=5&page=${page}`
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

// High-performance poster quality with 720p maximum cap
// w342 is default for cards (~60KB, loads 5x faster than w780), w780 for hero & detail page
export const getPosterUrl = (path, size = "w342") => {
  if (!path) return null;
  let finalSize = size;
  if (
    finalSize === "original" ||
    finalSize === "w1280" ||
    finalSize === "1080p" ||
    finalSize === "w1080" ||
    finalSize === "720p" ||
    finalSize === "hd"
  ) {
    finalSize = "w780";
  }
  return `${IMAGE_BASE}/${finalSize}${path}`;
};

// Limit backdrop widescreen quality to 720p (w1280 is 1280x720, w780 for mobile)
export const getBackdropUrl = (path, size = "w1280") => {
  if (!path) return null;
  let finalSize = size;
  if (finalSize === "original" || finalSize === "1080p" || finalSize === "720p") {
    finalSize = "w1280";
  }
  return `${IMAGE_BASE}/${finalSize}${path}`;
};

// Responsive srcset tailored for grid card sizes (160px-280px display width)
export const getPosterSrcSet = (path) =>
  path
    ? `${IMAGE_BASE}/w185${path} 185w, ${IMAGE_BASE}/w342${path} 342w, ${IMAGE_BASE}/w500${path} 500w`
    : undefined;

