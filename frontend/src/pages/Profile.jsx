import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaBookmark, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('liked');
  const [likedStories, setLikedStories] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileStories = useCallback(async () => {
    try {
      setLoading(true);
      const [likedRes, savedRes] = await Promise.all([
        axios.get('http://localhost:8000/api/profile/liked-stories', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/profile/saved-stories', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setLikedStories(likedRes.data.stories.data);
      setSavedStories(savedRes.data.stories.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile stories:', error);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchProfileStories();
  }, [currentUser, navigate, fetchProfileStories]);

  const stories = activeTab === 'liked' ? likedStories : savedStories;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="profile-title">My Profile</h1>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-avatar">
          {currentUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <h2>{currentUser?.name}</h2>
          <p>{currentUser?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
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

      {/* Stories Grid */}
      <div className="stories-grid">
        {loading ? (
          <div className="loading">Loading your stories...</div>
        ) : stories.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">{activeTab === 'liked' ? '❤️' : '🔖'}</p>
            <p>No {activeTab} stories yet</p>
            <p className="empty-text">Stories you {activeTab} will appear here</p>
          </div>
        ) : (
          stories.map((story, index) => (
            <motion.div
              key={story.id}
              className="story-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {story.image && (
                <div className="story-image">
                  <img src={story.image} alt={story.title} />
                  <div className="story-overlay">
                    <div className="tab-icon">
                      {activeTab === 'liked' ? (
                        <FaHeart className="liked-icon" />
                      ) : (
                        <FaBookmark className="saved-icon" />
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="story-info">
                <h3 className="story-title">{story.title}</h3>
                {story.location && <p className="story-location">📍 {story.location}</p>}
                <p className="story-author">by {story.user?.name}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
