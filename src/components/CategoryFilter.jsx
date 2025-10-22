import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './CategoryFilter.css';

const CategoryFilter = ({ 
  categories, 
  genres, 
  currentCategory, 
  onCategoryChange, 
  onGenreSelect 
}) => {
  const [showGenres, setShowGenres] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  return (
    <motion.div 
      className="category-filter-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Genre Filter */}
      <div className="genre-filter">
        <motion.button
          onClick={() => setShowGenres(!showGenres)}
          className="genre-toggle-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Filter by Genre</span>
          {showGenres ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>

        <motion.div
          className={`genre-dropdown ${showGenres ? 'show' : ''}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: showGenres ? 1 : 0, 
            height: showGenres ? 'auto' : 0 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="genre-grid">
            {genres.map((genre) => (
              <motion.button
                key={genre.id}
                onClick={() => onGenreSelect(genre)}
                className="genre-chip"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 107, 107, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {genre.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CategoryFilter;
