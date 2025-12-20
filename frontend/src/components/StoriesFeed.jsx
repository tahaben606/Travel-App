import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './StoriesFeed.css';

const StoriesFeed = () => {
  const { currentUser, token } = useAuth();
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedStories, setLikedStories] = useState(new Set());
  const [savedStories, setSavedStories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const extractLocations = (storiesList) => {
    const countries = new Set();
    const cities = new Set();

    storiesList.forEach(story => {
      if (story.location) {
        const parts = story.location.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          cities.add(parts[0]);
          countries.add(parts[parts.length - 1]);
        } else if (parts.length === 1) {
          countries.add(parts[0]);
        }
      }
    });

    setAvailableCountries(Array.from(countries).sort());
    setAvailableCities(Array.from(cities).sort());
  };

  const fetchStories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/stories');
      const storiesData = response.data.stories.data;
      setStories(storiesData);
      extractLocations(storiesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = stories;

    if (selectedCountries.size > 0 || selectedCities.size > 0) {
      filtered = stories.filter(story => {
        if (!story.location) return false;

        const parts = story.location.split(',').map(part => part.trim());
        const city = parts.length >= 2 ? parts[0] : '';
        const country = parts[parts.length - 1];

        const countryMatch = selectedCountries.size === 0 || selectedCountries.has(country);
        const cityMatch = selectedCities.size === 0 || selectedCities.has(city);

        return countryMatch && cityMatch;
      });
    }

    setFilteredStories(filtered);
    setCurrentIndex(0);
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories, selectedCountries, selectedCities]);

  const handleLike = async (storyId, isLiked) => {
    if (!currentUser) {
      alert('Please log in to like stories');
      return;
    }

    try {
      const endpoint = isLiked
        ? `http://localhost:8000/api/stories/${storyId}/unlike`
        : `http://localhost:8000/api/stories/${storyId}/like`;

      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newLiked = new Set(likedStories);
      if (isLiked) {
        newLiked.delete(storyId);
      } else {
        newLiked.add(storyId);
      }
      setLikedStories(newLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (storyId, isSaved) => {
    if (!currentUser) {
      alert('Please log in to save stories');
      return;
    }

    try {
      const endpoint = isSaved
        ? `http://localhost:8000/api/stories/${storyId}/unsave`
        : `http://localhost:8000/api/stories/${storyId}/save`;

      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newSaved = new Set(savedStories);
      if (isSaved) {
        newSaved.delete(storyId);
      } else {
        newSaved.add(storyId);
      }
      setSavedStories(newSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleNext = () => {
    const displayStories = selectedCountries.size > 0 || selectedCities.size > 0 ? filteredStories : stories;
    setCurrentIndex((prev) => (prev + 1) % displayStories.length);
  };

  const handlePrev = () => {
    const displayStories = selectedCountries.size > 0 || selectedCities.size > 0 ? filteredStories : stories;
    setCurrentIndex((prev) => (prev - 1 + displayStories.length) % displayStories.length);
  };

  if (loading) {
    return <div className="stories-feed loading">Loading stories...</div>;
  }

  const displayStories = selectedCountries.size > 0 || selectedCities.size > 0 ? filteredStories : stories;

  if (displayStories.length === 0) {
    return (
      <div className="stories-feed empty">
        <div>No stories available{selectedCountries.size > 0 || selectedCities.size > 0 ? ' with selected filters' : ''}</div>
        {(selectedCountries.size > 0 || selectedCities.size > 0) && (
          <button 
            onClick={() => {
              setSelectedCountries(new Set());
              setSelectedCities(new Set());
            }}
            className="reset-filter-btn"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  const currentStory = displayStories[currentIndex];
  if (!currentStory) return null;

  const isLiked = likedStories.has(currentStory.id);
  const isSaved = savedStories.has(currentStory.id);

  return (
    <div className="stories-feed">
      {/* Filter Button */}
      <button 
        className="filter-toggle-btn"
        onClick={() => setShowFilterModal(!showFilterModal)}
        title="Filter by country and city"
      >
        🔍 Filter
        {(selectedCountries.size > 0 || selectedCities.size > 0) && (
          <span className="filter-badge">{selectedCountries.size + selectedCities.size}</span>
        )}
      </button>

      {/* Filter Modal */}
      {showFilterModal && (
        <motion.div 
          className="filter-modal"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="filter-modal-content">
            <div className="filter-modal-header">
              <h3>Filter by Location</h3>
              <button 
                className="close-filter-btn"
                onClick={() => setShowFilterModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="filter-section">
              <h4>Countries</h4>
              <div className="filter-options">
                {availableCountries.map(country => (
                  <label key={country} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCountries.has(country)}
                      onChange={(e) => {
                        const newCountries = new Set(selectedCountries);
                        if (e.target.checked) {
                          newCountries.add(country);
                        } else {
                          newCountries.delete(country);
                        }
                        setSelectedCountries(newCountries);
                      }}
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Cities</h4>
              <div className="filter-options">
                {availableCities.map(city => (
                  <label key={city} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCities.has(city)}
                      onChange={(e) => {
                        const newCities = new Set(selectedCities);
                        if (e.target.checked) {
                          newCities.add(city);
                        } else {
                          newCities.delete(city);
                        }
                        setSelectedCities(newCities);
                      }}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button 
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedCountries(new Set());
                  setSelectedCities(new Set());
                }}
              >
                Reset All
              </button>
              <button 
                className="apply-filter-btn"
                onClick={() => setShowFilterModal(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}
      <motion.div
        className="story-card"
        key={currentStory.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Story Image */}
        {currentStory.image && (
          <div className="story-image-container">
            <img src={currentStory.image} alt={currentStory.title} className="story-image" />
          </div>
        )}

        {/* Story Content */}
        <div className="story-content">
          {/* Author Info */}
          <div className="story-author">
            <div className="author-info">
              <h3 className="author-name">{currentStory.user?.name || 'Anonymous'}</h3>
              {currentStory.location && <p className="story-location">📍 {currentStory.location}</p>}
            </div>
          </div>

          {/* Story Title and Content */}
          <div className="story-text">
            <h2 className="story-title">{currentStory.title}</h2>
            <p className="story-description">{currentStory.content}</p>
          </div>

          {/* Like and Save Buttons */}
          <div className="story-actions">
            <motion.button
              className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => handleLike(currentStory.id, isLiked)}
              whileTap={{ scale: 0.9 }}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>Like</span>
            </motion.button>

            <motion.button
              className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => handleSave(currentStory.id, isSaved)}
              whileTap={{ scale: 0.9 }}
            >
              {isSaved ? <FaBookmark /> : <FaRegBookmark />}
              <span>Save</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="story-navigation">
        <button className="nav-btn prev-btn" onClick={handlePrev}>←</button>
        <span className="story-counter">{currentIndex + 1} / {displayStories.length}</span>
        <button className="nav-btn next-btn" onClick={handleNext}>→</button>
      </div>
    </div>
  );
};

export default StoriesFeed;
