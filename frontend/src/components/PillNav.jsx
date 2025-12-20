import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  FaMapMarkerAlt, 
  FaCompass, 
  FaBookOpen, 
  FaSuitcase, 
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaPlus,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './PillNav.css';

// Icons mapping for navigation items
const navIcons = {
  'Home': <FaMapMarkerAlt className="nav-icon" />,
  'Dashboard': <FaCompass className="nav-icon" />,
  'Stories': <FaBookOpen className="nav-icon" />,

  'Profile': <FaUserCircle className="nav-icon" />
};

const PillNav = ({
  logo = '✈️',
  logoAlt = 'Logo',
  className = '',
  showIcons = true,
  showAuthButtons = true,
  onLoginClick = () => {},
  onSignupClick = () => {}
}) => {
  // Get current user from auth context
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  
  // Navigation items based on authentication status
  const navItems = [
    { label: 'Home', href: '/', show: true },
    { label: 'Dashboard', href: '/dashboard', show: !!currentUser },
    { label: 'Stories', href: '/stories', show: !!currentUser },

  ].filter(item => item.show);
  const [hoveredItem, setHoveredItem] = useState(null);
  const pillRef = useRef(null);
  const navRef = useRef(null);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location]);

  // Check if a route is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    // Special handling for dashboard sub-routes
    if (path === '/dashboard') {
      return location.pathname.startsWith('/dashboard') || 
             location.pathname.startsWith('/stories') ||
             location.pathname.startsWith('/profile');
    }
    return location.pathname.startsWith(path);
  };

  // Animate pill on hover/active state change
  useEffect(() => {
    if (!pillRef.current || !navRef.current) return;

    let targetElement = null;
    
    // Find the active or hovered element
    if (hoveredItem) {
      targetElement = navRef.current.querySelector(`[data-href="${hoveredItem}"]`);
    } else {
      // Find the first matching active route
      for (const item of navItems) {
        if (isActive(item.href)) {
          targetElement = navRef.current.querySelector(`[data-href="${item.href}"]`);
          break;
        }
      }
    }

    if (!targetElement) return;

    const { width, x } = targetElement.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    const xPos = x - navRect.left;

    gsap.to(pillRef.current, {
      width: width + 'px',
      x: xPos + 'px',
      backgroundColor: 'var(--primary-color)',
      ease: 'power2.out',
      duration: 0.4,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem, hoveredItem, navItems, location]);

  const handleMouseEnter = (item) => {
    if (item.href === '/profile') {
      setShowProfileMenu(true);
    }
    setHoveredItem(item.href);
  };

  const handleMouseLeave = () => {
    setShowProfileMenu(false);
    setHoveredItem(null);
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItemsRef = useRef(null);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className='NavBar'>
      <nav className={`pill-nav ${className} ${isMenuOpen ? 'menu-open' : ''}`} ref={navRef}>
        <div className="pill-nav-container">
          <div className="pill-nav-logo">
            <Link to="/" className="logo-link" onClick={() => setIsMenuOpen(false)}>
              
              <span className="logo-text">TravelJournal</span>
            </Link>
          </div>
          
          <div className="pill-nav-content">
            <div className="pill-nav-items" ref={navItemsRef}>
              
               {navItems.map((item) => {
                const isItemActive = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`pill-nav-item ${isItemActive ? 'active' : ''}`}
                    data-href={item.href}
                    onMouseEnter={() => handleMouseEnter(item)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {showIcons && navIcons[item.label]}
                    <span className="nav-item-text">{item.label}</span>
                    {isItemActive && <div className="active-indicator" />}
                  </Link>
                );
              })}
              
              {/* User Profile Button */}
              {currentUser && (
                <div
                  className="profile-menu-wrapper"
                  ref={profileMenuRef}
                  onMouseEnter={() => {
                    setShowProfileMenu(true);
                    setHoveredItem('profile');
                  }}
                  onMouseLeave={() => {
                    setShowProfileMenu(false);
                    setHoveredItem(null);
                  }}
                >
                  <button
                    className="pill-nav-item profile-btn"
                    title={currentUser.name}
                  >
                    <FaUserCircle className="profile-icon" />
                    <span className="nav-item-text">{currentUser.name?.split(' ')[0]}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="profile-dropdown">
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        <FaCompass className="dropdown-icon" />
                        Go to Dashboard
                      </Link>
                      <Link
                        to="/stories/create"
                        className="dropdown-item"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        <FaPlus className="dropdown-icon" />
                        Add Story
                      </Link>
                      <button
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="dropdown-icon" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {showAuthButtons && !currentUser && (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                  <FaSignInAlt className="mr-2" />
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  <FaUserPlus className="mr-2" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          
        </div>
      </nav>
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMenu} />
      )}
    </div>
  );
};

export default PillNav;
