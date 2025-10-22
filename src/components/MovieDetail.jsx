import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPlus, FaHeart, FaBookmark, FaCalendar, FaClock, FaUser, FaQuoteLeft, FaTimes } from 'react-icons/fa';
import { BiMovie } from 'react-icons/bi';
import { MdRateReview, MdVerified } from 'react-icons/md';
import api from '../utils/api';
import { getMovieDetails, getImageUrl, getBackdropUrl } from '../utils/tmdbApi';
import { Link } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import MoodWheel from './MoodWheel';
import MoodPieHalf from './MoodPieHalf';
import GenrePie from './GenrePie';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [moodData, setMoodData] = useState([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    checkWatchlistStatus();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      
      // Try to get from TMDB first, fallback to local API
      let movieData;
      try {
        const tmdbResponse = await getMovieDetails(id);
        movieData = {
          _id: tmdbResponse.id,
          title: tmdbResponse.title,
          description: tmdbResponse.overview,
          posterURL: getImageUrl(tmdbResponse.poster_path),
          backdropURL: getBackdropUrl(tmdbResponse.backdrop_path),
          releaseYear: new Date(tmdbResponse.release_date).getFullYear(),
          averageRating: tmdbResponse.vote_average / 2,
          genres: tmdbResponse.genres || [],
          director: tmdbResponse.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown',
          directorId: tmdbResponse.credits?.crew?.find(c => c.job === 'Director')?.id,
          directorProfile: tmdbResponse.credits?.crew?.find(c => c.job === 'Director')?.profile_path,
          cast: tmdbResponse.credits?.cast?.slice(0, 6) || [],
          runtime: tmdbResponse.runtime,
          budget: tmdbResponse.budget,
          revenue: tmdbResponse.revenue,
          status: tmdbResponse.status,
          originalLanguage: tmdbResponse.original_language,
          productionCompanies: tmdbResponse.production_companies?.map(c => c.name) || [],
          tmdbId: tmdbResponse.id,
          credits: tmdbResponse.credits,
          trailerKey: tmdbResponse.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key || null
        };
      } catch (tmdbError) {
        console.log('TMDB not available, using local API');
        const [movieResponse, reviewsResponse] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/movies/${id}/reviews`)
        ]);
        movieData = movieResponse.data;
        setReviews(reviewsResponse.data);
      }
      
      setMovie(movieData);
      
      // Get reviews from local API
      try {
        const reviewsResponse = await api.get(`/movies/${id}/reviews`);
        setReviews(reviewsResponse.data);
        calculateMoodData(reviewsResponse.data);
      } catch (reviewError) {
        console.log('No local reviews available');
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch movie details. Please try again later.');
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoodData = (reviews) => {
    const moodCounts = {
      skip: 0,
      timepass: 0,
      good_to_go: 0,
      perfect: 0
    };

    reviews.forEach(review => {
      if (review.mood && moodCounts.hasOwnProperty(review.mood)) {
        moodCounts[review.mood]++;
      }
    });

    const moodOptions = [
      { id: 'skip', label: 'Skip', emoji: '😴', color: '#ef4444' },
      { id: 'timepass', label: 'Timepass', emoji: '😐', color: '#f59e0b' },
      { id: 'good_to_go', label: 'Good to Go', emoji: '😊', color: '#10b981' },
      { id: 'perfect', label: 'Perfect', emoji: '🤩', color: '#8b5cf6' }
    ];

    const moodData = moodOptions.map(option => ({
      ...option,
      count: moodCounts[option.id] || 0
    }));

    setMoodData(moodData);
  };

  const checkWatchlistStatus = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    setIsInWatchlist(watchlist.includes(id));
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  };

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (isInWatchlist) {
      const newWatchlist = watchlist.filter(movieId => movieId !== id);
      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
    } else {
      watchlist.push(id);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
    setIsInWatchlist(!isInWatchlist);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const updated = favorites.filter(movieId => movieId !== id);
      localStorage.setItem('favorites', JSON.stringify(updated));
    } else {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const openTrailer = () => {
    if (movie?.trailerKey) {
      setShowTrailer(true);
    } else {
      alert('Trailer not available for this title.');
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await api.post(`/movies/${id}/reviews`, reviewData);
      const newReviews = [response.data, ...reviews];
      setReviews(newReviews);
      setShowReviewForm(false);
      
      // Update mood data
      calculateMoodData(newReviews);
      
      // Update movie's average rating
      const avgRating = newReviews.reduce((sum, rev) => sum + rev.rating, 0) / newReviews.length;
      setMovie(prev => ({ ...prev, averageRating: avgRating }));
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Unknown error';
      console.error('Error submitting review:', message);
      alert(`Failed to submit review: ${message}`);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      skip: '😴',
      timepass: '😐',
      good_to_go: '😊',
      perfect: '🤩'
    };
    return moodMap[mood] || '😊';
  };

  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="detail-skeleton">
          <div className="skeleton poster" />
          <div className="skeleton lines">
            <div className="bar" style={{ width: '70%' }} />
            <div className="bar" style={{ width: '50%' }} />
            <div className="bar" style={{ width: '90%' }} />
            <div className="bar" style={{ width: '40%' }} />
            <div className="bar" style={{ width: '85%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-container">
        <div className="error">
          <BiMovie size={48} />
          <p>{error || 'Movie not found'}</p>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const userHasReviewed = reviews.some(review => review.userId._id === user?.id);

  return (
    <div className="movie-detail-container">
      {/* Backdrop Image */}
      <AnimatePresence>
        {movie.backdropURL && (
          <motion.div 
            className="movie-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img src={movie.backdropURL} alt={movie.title} />
            <div className="backdrop-overlay" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="movie-detail-content">
        <motion.div 
          className="movie-poster-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src={movie.posterURL || 'https://via.placeholder.com/400x600?text=No+Poster'} 
            alt={movie.title}
            className="movie-poster-large"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600?text=No+Poster';
            }}
          />
        </motion.div>
        
        <motion.div 
          className="movie-info-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link to="/" className="crumb">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb current">{movie.title}</span>
          </nav>

          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-rating-large">
            <div className="stars">
              {renderStars(movie.averageRating)}
            </div>
            <span className="rating-text">{movie.averageRating.toFixed(1)}/5</span>
            <span className="review-count">({reviews.length} reviews)</span>
          </div>
          
          <div className="movie-meta">
            <p><strong><FaCalendar /> Year:</strong> {movie.releaseYear}</p>
            {movie.runtime && (
              <p><strong><FaClock /> Runtime:</strong> {movie.runtime} minutes</p>
            )}
            {movie.status && (
              <p><strong>Status:</strong> {movie.status}</p>
            )}
            
            {movie.genres && movie.genres.length > 0 && (
              <GenrePie genres={movie.genres} />
            )}
            
            <div className="people-row">
              <div className="person-block">
                <strong><FaUser /> Director:</strong>
                {movie.directorId ? (
                  <Link className="person-link" to={`/?personId=${movie.directorId}&personName=${encodeURIComponent(movie.director)}`}>
                    <img src={getImageUrl(movie.directorProfile, 'w185')} alt={movie.director} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span>{movie.director}</span>
                  </Link>
                ) : (
                  <span className="person-text">{movie.director}</span>
                )}
              </div>
              
              {movie.cast && movie.cast.length > 0 && (
                <div className="person-block">
                  <strong>Cast:</strong>
                  <div className="cast-thumbs">
                    {movie.cast.slice(0, 6).map(c => (
                      <Link key={c.id} className="person-link" to={`/?personId=${c.id}&personName=${encodeURIComponent(c.name)}`}>
                        <img src={getImageUrl(c.profile_path, 'w185')} alt={c.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span>{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="movie-description">
            <h3>Synopsis</h3>
            <p>{movie.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="movie-actions">
            <motion.button
              className="action-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openTrailer}
            >
              <FaPlay /> Watch Trailer
            </motion.button>
            
            <motion.button
              className={`action-btn ${isInWatchlist ? 'active' : ''}`}
              onClick={toggleWatchlist}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBookmark /> {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </motion.button>
            
            <motion.button
              className={`action-btn ${isFavorite ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFavorite}
            >
              <FaHeart /> Favorite
            </motion.button>
          </div>
          
          {user && !userHasReviewed && (
            <motion.button 
              onClick={() => setShowReviewForm(true)}
              className="review-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdRateReview /> Write a Review
            </motion.button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewForm 
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showTrailer && (
          <motion.div 
            className="trailer-overlay" 
            onClick={() => setShowTrailer(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="trailer-modal" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className="close-trailer"
                onClick={() => setShowTrailer(false)}
              >
                <FaTimes />
              </button>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Reviews Section */}
      <motion.div 
        className="reviews-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="reviews-header">
          <h2><MdRateReview /> Reviews & Ratings</h2>
          <div className="reviews-stats">
            <div className="stat-item">
              <span className="stat-number">{reviews.length}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{movie.averageRating.toFixed(1)}</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
        </div>

        {moodData.length > 0 && (
          <motion.div 
            className="mood-and-reviews"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <MoodPieHalf moodData={moodData} />
            <div className="mood-summary">
              <h3>Audience Mood</h3>
              <div className="mood-breakdown">
                {moodData.map(mood => (
                  <div key={mood.id} className="mood-item">
                    <span className="mood-emoji-large">{mood.emoji}</span>
                    <div className="mood-info">
                      <span className="mood-label">{mood.label}</span>
                      <span className="mood-count">{mood.count} reviews</span>
                      <div className="mood-bar">
                        <div 
                          className="mood-fill" 
                          style={{ 
                            width: `${reviews.length > 0 ? (mood.count / reviews.length) * 100 : 0}%`,
                            backgroundColor: mood.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {reviews.length === 0 ? (
          <motion.div 
            className="no-reviews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <MdRateReview size={48} />
            <h3>No reviews yet</h3>
            <p>Be the first to share your thoughts about this movie!</p>
          </motion.div>
        ) : (
          <motion.div 
            className="reviews-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {reviews.map((review, index) => (
              <motion.div 
                key={review._id} 
                className="review-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.userId.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="reviewer-details">
                      <Link to={`/user/${review.userId._id}`} className="reviewer-name">
                        {review.userId.username}
                        <MdVerified className="verified-icon" />
                      </Link>
                      <span className="review-date">
                        <FaCalendar /> {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                  <div className="review-rating">
                    {review.mood && (
                      <div className="mood-indicator">
                        <span className="mood-emoji">{getMoodEmoji(review.mood)}</span>
                        <span className="mood-text">
                          {moodData.find(m => m.id === review.mood)?.label}
                        </span>
                      </div>
                    )}
                    <div className="rating-stars">
                      {renderStars(review.rating)}
                      <span className="rating-value">{review.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                {review.comment && (
                  <div className="review-content">
                    <FaQuoteLeft className="quote-icon" />
                    <p className="review-comment">{review.comment}</p>
                  </div>
                )}
                
                <div className="review-actions">
                  <button className="review-action helpful">
                    👍 Helpful
                  </button>
                  <button className="review-action share">
                    📤 Share
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MovieDetail;