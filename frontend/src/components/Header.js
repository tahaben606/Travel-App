import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, User, Home, BookOpen, Luggage, Plus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../styles/header.css';

const Header = () => {
  const { user, logout, isAuthenticated, authHeader } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeader ? authHeader() : {}) },
      });
    } finally {
      logout();
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Check active route for nav highlighting
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          <MapPin size={24} />
          <span>Travel Stories</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/stories" className={`nav-link ${isActive('/stories') ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Stories</span>
          </Link>
          <Link to="/stories/create" className="create-story-btn">
            <Plus size={18} />
            <span>New Story</span>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mobile-nav">
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/stories" className={`nav-link ${isActive('/stories') ? 'active' : ''}`}>
                  <BookOpen size={18} />
                  <span>Stories</span>
                </Link>
                <Link to="/stories/create" className="nav-link">
                  <Plus size={18} />
                  <span>New Story</span>
                </Link>
              </div>
              
              <div className="mobile-user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="user-name">{user?.name || 'User'}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop User Menu */}
        <div className="user-menu">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="dropdown-menu">
            <div className="dropdown-item">
              <User size={16} />
              <span>Profile</span>
            </div>
            <div className="dropdown-divider"></div>
            <button onClick={handleLogout} className="dropdown-item">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

