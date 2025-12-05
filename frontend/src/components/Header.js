import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, User, Home, BookOpen, Luggage } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/dashboard" className="logo">
            <MapPin size={28} />
            <span>Travel Story</span>
          </Link>
        </motion.div>

        <nav className="header-nav">
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link to="/dashboard" className="nav-link">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link to="/dashboard" className="nav-link">
              <BookOpen size={20} />
              <span>Stories</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link to="/packing" className="nav-link">
              <Luggage size={20} />
              <span>Packing</span>
            </Link>
          </motion.div>
        </nav>

        <div className="header-user">
          <motion.div 
            className="user-info"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={20} />
            <span>{user?.name || 'User'}</span>
          </motion.div>
          <motion.button 
            onClick={handleLogout} 
            className="logout-btn"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;

