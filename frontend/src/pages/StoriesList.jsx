"use client"

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiCalendar, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Stories.css';

const StoriesList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stories');
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        const data = await response.json();
        setStories(data.stories.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="stories-loading">
        <div className="spinner"></div>
        <p>Loading stories...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="stories-container">
      <div className="stories-header">
        <h1>Travel Stories</h1>
        {currentUser && (
          <Link to="/stories/create" className="create-story-btn">
            <FiPlus /> Share Your Story
          </Link>
        )}
      </div>

      <div className="stories-grid">
        {stories.length > 0 ? (
          stories.map((story) => (
            <motion.div
              key={story.id}
              className="story-card"
              whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {story.image && (
                <div className="story-image">
                  <img 
                    src={`http://localhost:8000/storage/${story.image}`} 
                    alt={story.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x250/00BCD4/FFFFFF?text=No+Image';
                    }}
                  />
                </div>
              )}
              <div className="story-content">
                <h2>{story.title}</h2>
                <div className="story-meta">
                  {story.location && (
                    <span className="meta-item">
                      <FiMapPin /> {story.location}
                    </span>
                  )}
                  <span className="meta-item">
                    <FiCalendar /> {new Date(story.published_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="story-excerpt">
                  {story.content.length > 150 
                    ? `${story.content.substring(0, 150)}...` 
                    : story.content}
                </p>
                <Link to={`/stories/${story.id}`} className="read-more">
                  Read More <FiArrowRight />
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-stories">
            <p>No stories found. Be the first to share your travel experience!</p>
            {!currentUser && (
              <Link to="/login" className="auth-prompt">
                Log in to share your story
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesList;
