import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaPlus, FaMapPin, FaEye, FaHeart, FaBookmark, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState('my-stories');
  const [myStories, setMyStories] = useState([]);
  const [likedStories, setLikedStories] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalStories: 0,
    totalSaves: 0
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user's own stories
      const storiesRes = await axios.get(
        'http://localhost:8000/api/user/stories',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch liked stories
      const likedRes = await axios.get(
        'http://localhost:8000/api/profile/liked-stories',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch saved stories
      const savedRes = await axios.get(
        'http://localhost:8000/api/profile/saved-stories',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userStories = storiesRes.data.stories || [];
      const liked = likedRes.data.stories?.data || [];
      const saved = savedRes.data.stories?.data || [];

      // Calculate stats
      const totalViews = userStories.reduce((sum, story) => sum + (story.views || 0), 0);
      const totalLikes = userStories.reduce((sum, story) => sum + (story.likedBy?.length || 0), 0);

      setMyStories(userStories);
      setLikedStories(liked);
      setSavedStories(saved);
      setStats({
        totalViews,
        totalLikes,
        totalStories: userStories.length,
        totalSaves: saved.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser && token) {
      fetchDashboardData();
    }
  }, [currentUser, token, fetchDashboardData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStories = (stories, showAuthor = false) => {
    if (stories.length === 0) {
      return (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="empty-icon">
            {activeTab === 'my-stories' ? '📝' : activeTab === 'liked' ? '❤️' : '🔖'}
          </p>
          <p>No {activeTab.replace('-', ' ')} yet</p>
          {activeTab === 'my-stories' && (
            <Link to="/stories/create" className="btn btn-primary btn-lg">
              <FaPlus size={20} />
              <span>Create Your First Story</span>
            </Link>
          )}
        </motion.div>
      );
    }

    return (
      <div className="stories-grid">
        {stories.map((story, idx) => (
          <motion.div
            key={story.id}
            className="story-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/stories/${story.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {story.image && (
              <div className="story-cover">
                <img 
                  src={`http://localhost:8000/storage/${story.image}`} 
                  alt={story.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/667eea/ffffff?text=No+Image';
                  }}
                />
                {activeTab === 'my-stories' && (
                  <div className="story-stats-badge">
                    <span className="stat-item">
                      <FaEye /> {story.views || 0}
                    </span>
                    <span className="stat-item">
                      <FaHeart /> {story.likedBy?.length || 0}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="story-content">
              <h3>{story.title}</h3>
              {story.location && (
                <p className="story-location">
                  <FaMapPin size={16} />
                  {story.location}
                </p>
              )}
              {showAuthor && story.user && (
                <p className="story-author">by {story.user.name}</p>
              )}
              <p className="story-description">
                {story.content?.substring(0, 100)}...
              </p>
              <div className="story-meta">
                <span className="story-date">
                  {formatDate(story.published_at || story.created_at)}
                </span>
              </div>
              <Link to={`/stories/${story.id}`} className="story-link">
                View Story <FaArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {currentUser?.name}!</h1>
            <p>Track your travel stories and discover amazing adventures</p>
          </div>
          <Link to="/stories/create" className="btn btn-primary">
            <FaPlus size={20} />
            <span>New Story</span>
          </Link>
        </div>
        <div className="dashboard-tabs">
          <motion.button
            className={`tab-btn ${activeTab === 'my-stories' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-stories')}
            whileTap={{ scale: 0.95 }}
          >
            <FaBookmark /> My Stories ({stats.totalStories})
          </motion.button>
          <motion.button
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
            whileTap={{ scale: 0.95 }}
          >
            <FaHeart /> Liked Stories ({likedStories.length})
          </motion.button>
          <motion.button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
            whileTap={{ scale: 0.95 }}
          >
            <FaBookmark /> Saved Stories ({savedStories.length})
          </motion.button>
        </div>
        {/* Stats Section */}
        {activeTab === 'my-stories' && (
          <motion.div
            className="stats-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-card">
              <div className="stat-icon stories-icon">
                <FaBookmark size={24} />
              </div>
              <div className="stat-info">
                <h4>Stories Published</h4>
                <p className="stat-value">{stats.totalStories}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon views-icon">
                <FaEye size={24} />
              </div>
              <div className="stat-info">
                <h4>Total Views</h4>
                <p className="stat-value">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon likes-icon">
                <FaHeart size={24} />
              </div>
              <div className="stat-info">
                <h4>Total Likes</h4>
                <p className="stat-value">{stats.totalLikes}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon saves-icon">
                <FaBookmark size={24} />
              </div>
              <div className="stat-info">
                <h4>Saved by Others</h4>
                <p className="stat-value">{stats.totalSaves}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs Section */}
        

        {/* Stories Display */}
        {loading ? (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </motion.div>
        ) : (
          <>
            {activeTab === 'my-stories' && renderStories(myStories)}
            {activeTab === 'liked' && renderStories(likedStories, true)}
            {activeTab === 'saved' && renderStories(savedStories, true)}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

