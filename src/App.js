import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import Header from './components/Header';
import MovieList from './components/MovieList';
import MovieDetail from './components/MovieDetail';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import './App.css';
import BackToTop from './components/BackToTop';

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<MovieList />} />
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Scroll progress tracking
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    function raf(time) {
      lenis.raf(time);
      updateScrollProgress();
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Scroll Progress Indicator */}
        <div 
          className="scroll-indicator" 
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
        
        <Header />
        <main className="main-content page-fade">
          <AppRoutes />
        </main>
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;
