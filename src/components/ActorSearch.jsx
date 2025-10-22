import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes, FaStar, FaPlay } from 'react-icons/fa';
import { searchActors, getActorDetails, getMoviesByActor, getImageUrl } from '../utils/tmdbApi';
import './ActorSearch.css';

const ActorSearch = ({ onActorSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [actors, setActors] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.length > 2) {
      searchActorsDebounced();
    } else {
      setActors([]);
    }
  }, [query]);

  const searchActorsDebounced = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchActors(query);
      setActors(response.results || []);
    } catch (err) {
      setError('Failed to search actors');
      console.error('Error searching actors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActorClick = async (actor) => {
    try {
      setLoading(true);
      setError(null);
      
      const [actorDetails, moviesResponse] = await Promise.all([
        getActorDetails(actor.id),
        getMoviesByActor(actor.id)
      ]);
      
      setSelectedActor({
        ...actorDetails,
        profile_path: actor.profile_path
      });
      
      const transformedMovies = moviesResponse.cast.map(movie => ({
        _id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterURL: getImageUrl(movie.poster_path),
        backdropURL: getImageUrl(movie.backdrop_path, 'w1280'),
        releaseYear: new Date(movie.release_date).getFullYear(),
        averageRating: movie.vote_average / 2,
        genre: movie.genre_ids ? [] : [], // Will be populated by genre names
        tmdbId: movie.id,
        originalTitle: movie.original_title,
        popularity: movie.popularity,
        voteCount: movie.vote_count,
        character: movie.character
      }));
      
      setActorMovies(transformedMovies);
    } catch (err) {
      setError('Failed to load actor details');
      console.error('Error loading actor details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (movie) => {
    onActorSelect(movie);
    onClose();
  };

  return (
    <motion.div 
      className="actor-search-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="actor-search-modal"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="actor-search-header">
          <h2>Search Actors</h2>
          <motion.button 
            onClick={onClose} 
            className="close-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>
        </div>

        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for actors..."
            className="search-input"
          />
          {query && (
            <motion.button
              onClick={() => setQuery('')}
              className="clear-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          )}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {selectedActor ? (
          <div className="actor-details">
            <div className="actor-info">
              <img 
                src={getImageUrl(selectedActor.profile_path, 'w300')} 
                alt={selectedActor.name}
                className="actor-image"
              />
              <div className="actor-meta">
                <h3>{selectedActor.name}</h3>
                <p className="actor-bio">{selectedActor.biography}</p>
                <div className="actor-stats">
                  <span>Known for: {selectedActor.known_for_department}</span>
                  <span>Popularity: {selectedActor.popularity?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="actor-movies">
              <h4>Movies ({actorMovies.length})</h4>
              <div className="movies-grid">
                {actorMovies.slice(0, 12).map((movie) => (
                  <motion.div
                    key={movie._id}
                    className="movie-card"
                    onClick={() => handleMovieSelect(movie)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={movie.posterURL} 
                      alt={movie.title}
                      className="movie-poster"
                    />
                    <div className="movie-info">
                      <h5>{movie.title}</h5>
                      <p className="movie-year">{movie.releaseYear}</p>
                      {movie.character && (
                        <p className="movie-character">as {movie.character}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="actors-list">
            {actors.length > 0 ? (
              <div className="actors-grid">
                {actors.map((actor) => (
                  <motion.div
                    key={actor.id}
                    className="actor-card"
                    onClick={() => handleActorClick(actor)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={getImageUrl(actor.profile_path, 'w200')} 
                      alt={actor.name}
                      className="actor-thumbnail"
                    />
                    <div className="actor-name">{actor.name}</div>
                    <div className="actor-known-for">
                      {actor.known_for_department}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : query.length > 2 && !loading && (
              <div className="no-results">
                <p>No actors found for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ActorSearch;
