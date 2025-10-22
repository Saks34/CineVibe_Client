import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MovieCard.css';

function getFirstWords(name, count = 3) {
  return name.split(' ').slice(0, count).join(' ');
}

const MovieCard = ({ movie }) => {
  const firstWords = getFirstWords(movie.title);
  const isLong = movie.title.length > 20;

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

  return (
    <motion.div 
      className="movie-card"
      whileHover={{ 
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/movie/${movie._id}`} className="movie-link">
        <motion.div 
          className="movie-poster"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img 
            src={movie.posterURL || 'https://via.placeholder.com/300x450?text=No+Poster'} 
            alt={movie.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
            }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div className="movie-overlay" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            <div className="genre-badges">
              {(movie.genre || movie.genres || []).slice(0, 3).map((g, idx) => (
                <span key={idx} className="genre-badge">{typeof g === 'string' ? g : g.name}</span>
              ))}
            </div>
            <div className="overlay-bottom">
              <h3 
                className="movie-title"
                style={{
                  fontSize: isLong ? '1.2rem' : '2rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  width: '100%'
                }}
                title={movie.title}
              >
                {firstWords + (movie.title.length > firstWords.length ? '...' : '')}
              </h3>
              <div className="movie-rating">
                <div className="stars">
                  {renderStars(movie.averageRating)}
                </div>
                <span className="rating-text">{movie.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        <motion.div className="movie-info" />
      </Link>
    </motion.div>
  );
};

export default MovieCard;
