import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '21e1a8c56c558a27992d881744c300c1'; // You'll need to get this from TMDB
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Helper function to get full image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Helper function to get backdrop URL
export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return 'https://via.placeholder.com/1280x720?text=No+Backdrop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Get popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    
    const response = await tmdbApi.get('/movie/popular', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

// Get now playing movies
export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/now_playing', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

// Get upcoming movies
export const getUpcomingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos,reviews,similar'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

// Search movies
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: { 
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

// Get genres list
export const getGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

// Get movies by actor
export const getMoviesByActor = async (actorId, page = 1) => {
  try {
    const response = await tmdbApi.get(`/person/${actorId}/movie_credits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by actor:', error);
    throw error;
  }
};

// Search actors
export const searchActors = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/person', {
      params: { query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching actors:', error);
    throw error;
  }
};

// Get actor details
export const getActorDetails = async (actorId) => {
  try {
    const response = await tmdbApi.get(`/person/${actorId}`, {
      params: {
        append_to_response: 'movie_credits,images'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching actor details:', error);
    throw error;
  }
};

// Get trending movies
export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

// Get movie recommendations
export const getMovieRecommendations = async (movieId, page = 1) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
};

export default tmdbApi;
