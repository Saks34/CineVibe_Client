import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUser, FaHeart, FaBookmark, FaFire, FaStar } from 'react-icons/fa';
import ActorSearch from './ActorSearch';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isScrolled, setIsScrolled] = useState(false);
  const [showActorSearch, setShowActorSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsMobileNavOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileNavOpen(false);
    }
  };

  const handleActorSelect = (movie) => {
    navigate(`/movie/${movie._id}`);
    setIsMobileNavOpen(false);
  };

  return (
    <>
      <motion.header 
        className={`header ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="header-container">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="logo">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={() => navigate('/')}
              >
                CineVibes
              </motion.h1>
            </Link>
          </motion.div>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle navigation"
            className={`mobile-toggle ${isMobileNavOpen ? 'open' : ''}`}
            onClick={() => setIsMobileNavOpen(v => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          
          {/* Search Bar */}
          <motion.form 
            className="header-search"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="search-input"
              />
            </div>
          </motion.form>
          
          <nav className={`nav ${isMobileNavOpen ? 'open' : ''}`}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="nav-links"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/?category=trending" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>
                  <FaFire /> Trending
                </Link>
              </motion.div>

              {user && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/?category=watchlist" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>
                      <FaBookmark /> Watchlist
                      
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/?category=favorites" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>
                      <FaHeart /> Favorites
                    </Link>
                  </motion.div>
                </>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/?category=top_rated" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>
                  <FaStar /> Top Rated
                </Link>
              </motion.div>
              
              <motion.button
                onClick={() => setShowActorSearch(true)}
                className="nav-link actor-search-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaUser /> Actors
              </motion.button>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div
                  key="user-nav"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="nav-user"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/dashboard" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>
                      <FaBookmark /> Dashboard
                    </Link>
                  </motion.div>
                  <motion.button 
                    onClick={handleLogout} 
                    className="nav-link logout-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="guest-nav"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="nav-guest"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/login" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>Login</Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/register" className="nav-link" onClick={() => setIsMobileNavOpen(false)}>Register</Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            
          </nav>
        </div>
      </motion.header>

      {/* Actor Search Modal */}
      <AnimatePresence>
        {showActorSearch && (
          <ActorSearch
            onActorSelect={handleActorSelect}
            onClose={() => setShowActorSearch(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
