"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiImage, FiMapPin, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Stories.css';
import locationsData from '../data/locations.json';

const CreateStory = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    type: 'other',
    image: null,
    imageUrl: '',
    is_published: true
  });

  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/stories/create' } });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Load countries on component mount
    if (locationsData.locations) {
      const countries = locationsData.locations.map(loc => loc.c);
      setAvailableCountries(countries);
    }
  }, []);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    
    // Find cities for selected country
    if (country) {
      const countryData = locationsData.locations.find(loc => loc.c === country);
      setAvailableCities(countryData?.ct || []);
    } else {
      setAvailableCities([]);
    }
    
    // Reset location
    setFormData(prev => ({ ...prev, location: '' }));
  };

  const handleLocationChange = (e) => {
    const city = e.target.value;
    if (city && selectedCountry) {
      setFormData(prev => ({ ...prev, location: `${city}, ${selectedCountry}` }));
    }
  };

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
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('type', formData.type.toLowerCase());
      formDataToSend.append('is_published', formData.is_published ? '1' : '0');
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      // Only append imageUrl if it's a non-empty, valid URL
      if (formData.imageUrl && formData.imageUrl.trim()) {
        try {
          new URL(formData.imageUrl); // Validate URL format
          formDataToSend.append('imageUrl', formData.imageUrl);
        } catch (e) {
          throw new Error('Please enter a valid image URL (must start with http:// or https://)');
        }
      }

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

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
        // Log detailed error information for debugging
        console.error('API Error Response:', data);
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          throw new Error(errorMessages);
        }
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
            <label htmlFor="country">
              <FiMapPin /> Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={handleCountryChange}
              className="location-select"
            >
              <option value="">Select a country</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="form-group location-group">
            <label htmlFor="city">City</label>
            <select
              id="city"
              onChange={handleLocationChange}
              className="location-select"
              disabled={!selectedCountry}
            >
              <option value="">Select a city</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-group type-group">
            <label htmlFor="type">Story Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="type-select"
            >
              {locationsData.types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
          
          <div className="image-input-divider">
            <span>or</span>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="url-input"
            />
            {formData.imageUrl && !formData.image && (
              <button
                type="button"
                className="btn-preview-url"
                onClick={() => setPreview(formData.imageUrl)}
              >
                Preview URL Image
              </button>
            )}
          </div>
          
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
              <button 
                type="button" 
                className="remove-image"
                onClick={() => {
                  setPreview('');
                  setFormData(prev => ({ ...prev, image: null, imageUrl: '' }));
                }}
              >
                Remove
              </button>
            </div>
          )}
          
          <p className="hint">
            Add a beautiful image that represents your story (optional). Use file upload or provide an image URL.
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
