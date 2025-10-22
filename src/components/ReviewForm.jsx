import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, onCancel }) => {
  const [moodRating, setMoodRating] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions = [
    { 
      id: 'skip', 
      label: 'Skip', 
      emoji: '😴', 
      description: 'Not worth watching',
      color: '#ff4757'
    },
    { 
      id: 'timepass', 
      label: 'Timepass', 
      emoji: '😐', 
      description: 'Okay for passing time',
      color: '#ffa502'
    },
    { 
      id: 'good_to_go', 
      label: 'Good to Go', 
      emoji: '😊', 
      description: 'Worth watching',
      color: '#2ed573'
    },
    { 
      id: 'perfect', 
      label: 'Perfect', 
      emoji: '🤩', 
      description: 'Must watch!',
      color: '#ff6b6b'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!moodRating) {
      alert('Please select a mood rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        rating: moodRating, 
        comment,
        mood: moodRating
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMoodOptions = () => {
    return moodOptions.map((option) => (
      <motion.button
        key={option.id}
        type="button"
        className={`mood-option ${moodRating === option.id ? 'selected' : ''}`}
        onClick={() => setMoodRating(option.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          '--option-color': option.color
        }}
      >
        <div className="mood-emoji">{option.emoji}</div>
        <div className="mood-label">{option.label}</div>
        <div className="mood-description">{option.description}</div>
      </motion.button>
    ));
  };

  return (
    <motion.div 
      className="review-form-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="review-form-modal"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="review-form-header">
          <h3>Rate this Movie</h3>
          <motion.button 
            onClick={onCancel} 
            className="close-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>How was this movie? *</label>
            <div className="mood-options">
              {renderMoodOptions()}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="comment">Share your thoughts (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think about this movie..."
              rows="4"
              maxLength="500"
            />
            <span className="char-count">{comment.length}/500</span>
          </div>
          
          <div className="form-actions">
            <motion.button 
              type="button" 
              onClick={onCancel}
              className="cancel-btn"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting || !moodRating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewForm;
