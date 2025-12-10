"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Stories.css';

const StoryDetail = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/stories/${id}`);
        if (!response.ok) {
          throw new Error('Story not found');
        }
        const data = await response.json();
        setStory(data.story);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:8000/api/stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      navigate('/stories');
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="story-loading">
        <div className="spinner"></div>
        <p>Loading story...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <Link to="/stories" className="back-link">
          <FiArrowLeft /> Back to Stories
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="not-found">
        <h2>Story not found</h2>
        <Link to="/stories" className="back-link">
          <FiArrowLeft /> Back to Stories
        </Link>
      </div>
    );
  }

  const isAuthor = currentUser && story.user_id === currentUser.id;

  return (
    <div className="story-detail-container">
      <Link to="/stories" className="back-link">
        <FiArrowLeft /> Back to Stories
      </Link>

      <motion.article 
        className="story-article"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="story-header">
          <div className="story-meta">
            <h1>{story.title}</h1>
            <div className="meta-info">
              {story.location && (
                <span className="meta-item">
                  <FiMapPin /> {story.location}
                </span>
              )}
              <span className="meta-item">
                <FiCalendar /> {new Date(story.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="meta-author">
                By {story.user?.name || 'Anonymous'}
              </span>
            </div>
          </div>
          
          {isAuthor && (
            <div className="story-actions">
              <Link to={`/stories/${story.id}/edit`} className="btn-edit">
                <FiEdit2 /> Edit
              </Link>
              <button 
                onClick={handleDelete} 
                className="btn-delete"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : <><FiTrash2 /> Delete</>}
              </button>
            </div>
          )}
        </header>

        {story.image && (
          <div className="story-featured-image">
            <img 
              src={`http://localhost:8000/storage/${story.image}`} 
              alt={story.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x450/00BCD4/FFFFFF?text=No+Image';
              }}
            />
          </div>
        )}

        <div 
          className="story-content" 
          dangerouslySetInnerHTML={{ 
            __html: story.content.replace(/\n/g, '<br />')
          }} 
        />

        <footer className="story-footer">
          <Link to="/stories" className="back-link">
            <FiArrowLeft /> Back to Stories
          </Link>
        </footer>
      </motion.article>
    </div>
  );
};

export default StoryDetail;
