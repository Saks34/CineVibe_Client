import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaSearch, FaFilter, FaFire, FaStar, FaClock, FaPlay } from 'react-icons/fa';
import api from '../utils/api';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies,
  getTrendingMovies,
  getMoviesByActor,
  getMovieDetails,
  searchMovies,
  getGenres,
  getMoviesByGenre,
  getImageUrl
} from '../utils/tmdbApi';
import MovieCard from './MovieCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import './MovieList.css';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: gridRef, inView: gridInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure genres are loaded first to avoid 'Unknown'
    (async () => {
      await fetchGenres();
      fetchFromUrlAndLoad();
    })();
  }, []);

  const fetchFromUrlAndLoad = () => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const search = params.get('search');
    const personId = params.get('personId');
    const genreId = params.get('genreId');
    const genreName = params.get('genre');
    const lang = params.get('lang');
    if (category) setCurrentCategory(category);
    if (search) setSearchQuery(search);
    if (lang) setLanguage(lang);
    if (personId) setCurrentCategory('person');
    if (genreId && genreName) {
      setSelectedGenre({ id: Number(genreId), name: genreName });
      setCurrentCategory('genre');
    }
    fetchMovies();
  };

  useEffect(() => {
    if (currentCategory || selectedGenre || searchQuery || language !== undefined) {
      setPage(1);
      // sync URL
      const params = new URLSearchParams();
      if (currentCategory && !['search','genre','person','watchlist','favorites'].includes(currentCategory)) {
        params.set('category', currentCategory);
      }
      if (searchQuery) params.set('search', searchQuery);
      if (currentCategory === 'genre' && selectedGenre) {
        params.set('genreId', String(selectedGenre.id));
        params.set('genre', selectedGenre.name);
      }
      if (language) params.set('lang', language);
      navigate({ pathname: '/', search: params.toString() }, { replace: true });
      fetchMovies();
    }
  }, [currentCategory, selectedGenre, searchQuery, language]);

  const fetchGenres = async () => {
    try {
      const response = await getGenres();
      setGenres(response.genres);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      let response;
      const params = new URLSearchParams(location.search);
      const personId = params.get('personId');
      const personName = params.get('personName');
      
      if (currentCategory === 'watchlist') {
        const ids = JSON.parse(localStorage.getItem('watchlist') || '[]');
        const details = await Promise.all(ids.map(id => getMovieDetails(id)));
        response = { results: details };
      } else if (currentCategory === 'favorites') {
        const ids = JSON.parse(localStorage.getItem('favorites') || '[]');
        const details = await Promise.all(ids.map(id => getMovieDetails(id)));
        response = { results: details };
      } else if (searchQuery) {
        response = await searchMovies(searchQuery, page);
      } else if (selectedGenre) {
        response = await getMoviesByGenre(selectedGenre.id, page);
      } else if (currentCategory === 'person' && personId) {
        response = await getMoviesByActor(personId);
      } else {
        switch (currentCategory) {
          case 'popular':
            response = await getPopularMovies(page);
            break;
          case 'top_rated':
            response = await getTopRatedMovies(page);
            break;
          case 'now_playing':
            response = await getNowPlayingMovies(page);
            break;
          case 'upcoming':
            response = await getUpcomingMovies(page);
            break;
          case 'trending':
            response = await getTrendingMovies('week');
            break;
          default:
            response = await getPopularMovies(page);
        }
      }
      
      let list = response.results || response.cast || [];
      if (language) {
        list = list.filter(m => !language || m.original_language === language);
      }
      const transformedMovies = list.map(movie => ({
        _id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterURL: getImageUrl(movie.poster_path),
        backdropURL: getImageUrl(movie.backdrop_path, 'w1280'),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : '—',
        averageRating: movie.vote_average / 2, // Convert 10-point scale to 5-point
        genre: movie.genre_ids ? movie.genre_ids.map(id => genres.find(g => g.id === id)?.name).filter(Boolean) : (movie.genres?.map(g => g.name) || []),
        tmdbId: movie.id,
        originalTitle: movie.original_title,
        popularity: movie.popularity,
        voteCount: movie.vote_count,
        adult: movie.adult,
        originalLanguage: movie.original_language
      }));
      
      if (page === 1) {
        setMovies(transformedMovies);
      } else {
        setMovies(prev => [...prev, ...transformedMovies]);
      }
      
      setHasMore((response.page || 1) < (response.total_pages || 1));
      setError(null);
    } catch (err) {
      setError('Failed to fetch movies. Please try again later.');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchMovies();
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedGenre(null);
    setCurrentCategory('search');
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setSelectedGenre(null);
    setSearchQuery('');
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setCurrentCategory('genre');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="movie-list-container">
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton-card">
              <div className="skeleton-poster"></div>
              <div className="skeleton-bar" style={{ width: '70%' }}></div>
              <div className="skeleton-bar" style={{ width: '40%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-list-container">
        <motion.div 
          className="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {error}
          </motion.p>
          <motion.button 
            onClick={fetchMovies} 
            className="retry-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="movie-list-container">
      <motion.div 
        ref={headerRef}
        className="movie-list-header"
        initial={{ opacity: 0, y: 50 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {searchQuery ? `Search Results for "${searchQuery}"` : 
           selectedGenre ? `${selectedGenre.name} Movies` :
           (new URLSearchParams(location.search).get('personName') ? `Movies by ${new URLSearchParams(location.search).get('personName')}` : null) ||
           currentCategory === 'popular' ? 'Popular Movies' :
           currentCategory === 'top_rated' ? 'Top Rated Movies' :
           currentCategory === 'now_playing' ? 'Now Playing' :
           currentCategory === 'upcoming' ? 'Upcoming Movies' :
           currentCategory === 'trending' ? 'Trending Movies' :
           'Discover Movies'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {searchQuery ? `Found ${movies.length} movies` :
           selectedGenre ? `Explore ${selectedGenre.name} movies` :
           'Explore our collection of amazing films'}
        </motion.p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div 
        className="search-filter-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <SearchBar onSearch={handleSearch} />
        <div className="extra-filters">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="ta">Tamil</option>
            <option value="ml">Malayalam</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <CategoryFilter 
          categories={[
            { id: 'popular', name: 'Popular', icon: <FaFire /> },
            { id: 'top_rated', name: 'Top Rated', icon: <FaStar /> },
            { id: 'now_playing', name: 'Now Playing', icon: <FaPlay /> },
            { id: 'upcoming', name: 'Upcoming', icon: <FaClock /> },
            { id: 'trending', name: 'Trending', icon: <FaFire /> }
          ]}
          genres={genres}
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
          onGenreSelect={handleGenreSelect}
        />
      </motion.div>
      
      {movies.length === 0 && !loading ? (
        <motion.div 
          className="no-movies"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No movies found.</p>
        </motion.div>
      ) : (
        <motion.div 
          ref={gridRef}
          className="movie-grid"
          initial={{ opacity: 0 }}
          animate={gridInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, y: 50 }}
              animate={gridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && movies.length > 0 && (
        <motion.div 
          className="load-more-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={loadMore}
            disabled={loading}
            className="load-more-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Loading...' : 'Load More Movies'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default MovieList;
