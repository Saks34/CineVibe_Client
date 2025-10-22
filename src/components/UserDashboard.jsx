import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './UserDashboard.css';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (!userFromStorage) {
      navigate('/login');
      return;
    }
    setUser(userFromStorage);
  }, [navigate]);

  // Fetch user data function
  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/users/${user.id}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserData(response.data.user);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to fetch user data. Please try again.');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  // Star rating component
  const renderStars = (rating) => {
    if (!rating || isNaN(rating)) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>);
    }

    // Half star
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return <div className="stars">{stars}</div>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <motion.div 
          className="loading-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Loading your cinematic journey...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <motion.div 
          className="error-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <motion.button 
            onClick={fetchUserData} 
            className="retry-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="dashboard-container">
      {/* Hero Header */}
      <motion.div 
        className="dashboard-hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Welcome back, <span className="username-highlight">{userData?.username}</span>
        </motion.h1>
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your personal cinema dashboard
        </motion.p>
      </motion.div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <motion.div 
          className="profile-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            className="profile-card modern-card"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-header">
              <h2>Profile Information</h2>
              <div className="card-accent"></div>
            </div>
            <div className="profile-details">
              <div className="profile-item">
                <span className="label">Username</span>
                <span className="value">{userData?.username}</span>
              </div>
              <div className="profile-item">
                <span className="label">Email</span>
                <span className="value">{userData?.email}</span>
              </div>
              <div className="profile-item">
                <span className="label">Member Since</span>
                <span className="value">
                  {userData?.createdAt 
                    ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          className="stats-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="stats-grid">
            <motion.div 
              className="stat-card modern-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Reviews Written</h3>
                <div className="stat-number">{reviews.length}</div>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card modern-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="stat-icon">🎬</div>
              <div className="stat-content">
                <h3>Movies Watched</h3>
                <div className="stat-number">{userData?.watchHistory?.length || 0}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div 
          className="reviews-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="section-header">
            <h2>Your Reviews</h2>
            <div className="section-accent"></div>
          </div>
          
          {reviews.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="empty-icon">🎭</div>
              <h3>No reviews yet</h3>
              <p>Share your thoughts on movies you've watched</p>
              <Link to="/" className="cta-button">
                Browse Movies
              </Link>
            </motion.div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review, index) => (
                <motion.div 
                  key={review._id || index}
                  className="review-card modern-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                >
                  <div className="review-header">
                    <div className="movie-details">
                      {(review.moviePoster || review.movie?.poster) && (
                        <img 
                          src={review.moviePoster || review.movie?.poster} 
                          alt={review.movieTitle || review.movie?.title || 'Movie poster'}
                          className="movie-poster-mini"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="movie-info">
                        <h4>{review.movieTitle || review.movie?.title || 'Unknown Movie'}</h4>
                        {review.rating && (
                          <div className="review-rating">
                            {renderStars(review.rating)}
                            <span className="rating-value">{review.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <div className="review-content">
                      <p>"{review.comment}"</p>
                    </div>
                  )}
                  
                  <div className="review-footer">
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Watch History Section */}
        {userData?.watchHistory && userData.watchHistory.length > 0 && (
          <motion.div 
            className="watch-history-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="section-header">
              <h2>Watch History</h2>
              <div className="section-accent"></div>
            </div>
            
            <div className="watch-history-grid">
              {userData.watchHistory.slice(0, 6).map((movie, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link 
                    to={`/movie/${movie._id}`} 
                    className="watch-history-item modern-card"
                  >
                    <div className="movie-poster-container">
                      <img 
                        src={movie.posterURL || 'https://via.placeholder.com/200x300/2a2a2e/ffffff?text=No+Poster'} 
                        alt={movie.title}
                        className="movie-poster"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x300/2a2a2e/ffffff?text=No+Poster';
                        }}
                      />
                      <div className="movie-overlay">
                        <div className="play-button">▶</div>
                      </div>
                    </div>
                    <div className="movie-details">
                      <h4>{movie.title}</h4>
                      {movie.averageRating && (
                        <div className="movie-rating">
                          {renderStars(movie.averageRating)}
                          <span className="rating-value">
                            {movie.averageRating.toFixed(1)}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;