"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiImage, FiMapPin, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Stories.css';

const CreateStory = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    image: null,
    is_published: true
  });
  
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/stories/create' } });
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview('');
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('is_published', formData.is_published);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/stories', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create story');
      }

      navigate(`/stories/${data.story.id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="create-story-container">
      <div className="create-story-header">
        <Link to="/stories" className="back-link">
          <FiArrowLeft /> Back to Stories
        </Link>
        <h1>Share Your Travel Story</h1>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        className="story-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Story Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your story a compelling title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Your Story *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your travel experience..."
            rows="10"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group location-group">
            <label htmlFor="location">
              <FiMapPin /> Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where did this take place?"
            />
          </div>

          <div className="form-group publish-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Publish now
            </label>
            <p className="hint">
              {formData.is_published 
                ? 'Your story will be visible to everyone.'
                : 'Save as draft (only you can see it)'}
            </p>
          </div>
        </div>

        <div className="form-group">
          <label className="file-upload-label">
            <FiImage />
            {preview ? 'Change Image' : 'Add a Featured Image'}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
          </label>
          
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
              <button 
                type="button" 
                className="remove-image"
                onClick={() => {
                  setPreview('');
                  setFormData(prev => ({ ...prev, image: null }));
                }}
              >
                Remove
              </button>
            </div>
          )}
          
          <p className="hint">
            Add a beautiful image that represents your story (optional)
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Publishing...' : (
              <>
                <FiSave /> {formData.is_published ? 'Publish Story' : 'Save Draft'}
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateStory;
