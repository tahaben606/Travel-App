"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaChevronDown, FaTimes, FaSearch } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import "./StoriesList.css"

export default function StoriesList() {
  const navigate = useNavigate()
  const { token, user, isAuthenticated } = useAuth()
  const [stories, setStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [likedStories, setLikedStories] = useState(new Set())
  const [savedStories, setSavedStories] = useState(new Set())
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState(new Set())
  const [selectedCities, setSelectedCities] = useState(new Set())
  const [selectedTypes, setSelectedTypes] = useState(new Set())
  const [availableCountries, setAvailableCountries] = useState([])
  const [availableCities, setAvailableCities] = useState([])
  const [availableTypes, setAvailableTypes] = useState([])
  
  // Search states for dropdowns
  const [countrySearch, setCountrySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [typeSearch, setTypeSearch] = useState("")
  
  // Dropdown visibility states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  useEffect(() => {
    console.log("Auth state updated:", { token, user, isAuthenticated })
  }, [token, user, isAuthenticated])

  // Fetch stories from API
  useEffect(() => {
    fetchStories(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Apply filters when stories or filters change
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories, selectedCountries, selectedCities, selectedTypes])

  const fetchStories = async (page) => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:8000/api/stories?page=${page}`, {
        headers: { Accept: "application/json" },
      })

      const storiesData = response.data.stories.data || []
      setStories(storiesData)
      fetchLocations()
      setTotalPages(response.data.stories.last_page || 1)
    } catch (err) {
      console.error("Error fetching stories:", err)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      // Import locations from local JSON file
      const locationsData = await import("../data/locations.json")
      
      if (locationsData.locations) {
        // Extract countries from hierarchical data
        const countries = locationsData.locations.map(loc => loc.c)
        // Collect all unique cities
        const allCities = []
        locationsData.locations.forEach(loc => {
          allCities.push(...(loc.ct || []))
        })
        const uniqueCities = [...new Set(allCities)]
        
        setAvailableCountries(countries)
        setAvailableCities(uniqueCities)
        setAvailableTypes(locationsData.types || [])
      }
    } catch (err) {
      console.error("Error fetching locations:", err)
    }
  }

  const applyFilters = () => {
    let filtered = stories

    if (selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0) {
      filtered = stories.filter((story) => {
        // Location filter
        let locationMatch = true
        if (selectedCountries.size > 0 || selectedCities.size > 0) {
          if (!story.location) return false

          const parts = story.location.split(",").map((part) => part.trim())
          const city = parts.length >= 2 ? parts[0] : ""
          const country = parts[parts.length - 1]

          const countryMatch = selectedCountries.size === 0 || selectedCountries.has(country)
          const cityMatch = selectedCities.size === 0 || selectedCities.has(city)

          locationMatch = countryMatch && cityMatch
        }

        // Type filter
        let typeMatch = true
        if (selectedTypes.size > 0) {
          typeMatch = selectedTypes.has(story.type || "other")
        }

        return locationMatch && typeMatch
      })
    }

    setFilteredStories(filtered)
  }

  // Filter functions for search
  const filteredCountries = availableCountries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  )

  const filteredTypes = availableTypes.filter(type =>
    type.toLowerCase().includes(typeSearch.toLowerCase())
  )

  // Fetch user's liked and saved stories
  const fetchUserInteractions = useCallback(async () => {
    if (!token) return

    try {
      const [likedRes, savedRes] = await Promise.all([
        axios.get("http://localhost:8000/api/profile/liked-stories", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        axios.get("http://localhost:8000/api/profile/saved-stories", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
      ])

      const likedIds = new Set((likedRes.data.stories?.data || []).map((s) => s.id))
      const savedIds = new Set((savedRes.data.stories?.data || []).map((s) => s.id))
      setLikedStories(likedIds)
      setSavedStories(savedIds)
      console.log("User interactions loaded:", { likedIds: Array.from(likedIds), savedIds: Array.from(savedIds) })
    } catch (err) {
      console.error("Error fetching user interactions:", err.response?.data || err.message)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserInteractions()
    }
  }, [token, fetchUserInteractions, isAuthenticated])

  const handleLike = async (storyId, isLiked) => {
    console.log("Like button clicked:", { storyId, isLiked, token, user, isAuthenticated })

    if (!token) {
      alert("Please log in to like stories")
      return
    }

    try {
      const endpoint = isLiked
        ? `http://localhost:8000/api/stories/${storyId}/unlike`
        : `http://localhost:8000/api/stories/${storyId}/like`

      console.log("Sending like request to:", endpoint)

      const response = await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("Like response:", response.status, response.data)

      if (response.status === 201 || response.status === 200) {
        const newLiked = new Set(likedStories)
        isLiked ? newLiked.delete(storyId) : newLiked.add(storyId)
        setLikedStories(newLiked)
        console.log("Like state updated:", { isLiked: !isLiked })
      }
    } catch (err) {
      console.error("Error toggling like:", err.response?.data || err.message)
      alert("Failed to like story. Please try again.")
    }
  }

  const handleSave = async (storyId, isSaved) => {
    console.log("Save button clicked:", { storyId, isSaved, token, user, isAuthenticated })

    if (!token) {
      alert("Please log in to save stories")
      return
    }

    try {
      const endpoint = isSaved
        ? `http://localhost:8000/api/stories/${storyId}/unsave`
        : `http://localhost:8000/api/stories/${storyId}/save`

      console.log("Sending save request to:", endpoint)

      const response = await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("Save response:", response.status, response.data)

      if (response.status === 201 || response.status === 200) {
        const newSaved = new Set(savedStories)
        isSaved ? newSaved.delete(storyId) : newSaved.add(storyId)
        setSavedStories(newSaved)
        console.log("Save state updated:", { isSaved: !isSaved })
      }
    } catch (err) {
      console.error("Error toggling save:", err.response?.data || err.message)
      alert("Failed to save story. Please try again.")
    }
  }

  // Helper function to remove a selected filter
  const removeCountry = (country) => {
    const newCountries = new Set(selectedCountries)
    newCountries.delete(country)
    setSelectedCountries(newCountries)
  }

  const removeCity = (city) => {
    const newCities = new Set(selectedCities)
    newCities.delete(city)
    setSelectedCities(newCities)
  }

  const removeType = (type) => {
    const newTypes = new Set(selectedTypes)
    newTypes.delete(type)
    setSelectedTypes(newTypes)
  }

  if (loading) {
    return (
      <div className="stories-list-container loading">
        <div className="spinner">Loading travel stories...</div>
      </div>
    )
  }

  const displayStories = selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0 ? filteredStories : stories

  if (displayStories.length === 0) {
    return (
      <div className="stories-list-container empty">
        <div className="empty-state">
          <p>📍 No stories available{selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0 ? " with selected filters" : ""}</p>
          {(selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0) && (
            <button 
              onClick={() => {
                setSelectedCountries(new Set())
                setSelectedCities(new Set())
                setSelectedTypes(new Set())
              }}
              className="reset-filter-btn"
            >
              Reset Filters
            </button>
          )}
          {selectedCountries.size === 0 && selectedCities.size === 0 && selectedTypes.size === 0 && (
            <p>Be the first to share your travel adventure!</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="ig-container">
      {/* Filter Button */}
      <button 
        className="filter-toggle-btn"
        onClick={() => setShowFilterModal(!showFilterModal)}
        title="Filter by country and city"
      >
        🔍 Filter
        {(selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0) && (
          <span className="filter-badge">{selectedCountries.size + selectedCities.size + selectedTypes.size}</span>
        )}
      </button>

      {/* Selected Filters Display */}
      {(selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0) && (
        <div className="selected-filters">
          {Array.from(selectedCountries).map(country => (
            <span key={country} className="filter-chip">
              {country}
              <button onClick={() => removeCountry(country)} className="remove-filter">
                <FaTimes />
              </button>
            </span>
          ))}
          {Array.from(selectedCities).map(city => (
            <span key={city} className="filter-chip">
              {city}
              <button onClick={() => removeCity(city)} className="remove-filter">
                <FaTimes />
              </button>
            </span>
          ))}
          {Array.from(selectedTypes).map(type => (
            <span key={type} className="filter-chip">
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <button onClick={() => removeType(type)} className="remove-filter">
                <FaTimes />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Modal with Search Dropdowns */}
      {showFilterModal && (
        <div className="filter-modal">
          <div className="filter-modal-content">
            <div className="filter-modal-header">
              <h3>Filter Stories</h3>
              <button 
                className="close-filter-btn"
                onClick={() => setShowFilterModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Countries Search Dropdown */}
            <div className="filter-section">
              <label className="filter-label">Countries</label>
              <div className="search-dropdown-container">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onFocus={() => setShowCountryDropdown(true)}
                    className="search-dropdown-input"
                  />
                  {countrySearch && (
                    <button 
                      onClick={() => setCountrySearch("")}
                      className="clear-search-btn"
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button 
                    className="dropdown-toggle"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <FaChevronDown />
                  </button>
                </div>
                
                {showCountryDropdown && (
                  <div className="dropdown-list">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country}
                          className={`dropdown-item ${selectedCountries.has(country) ? 'selected' : ''}`}
                          onClick={() => {
                            const newCountries = new Set(selectedCountries)
                            if (newCountries.has(country)) {
                              newCountries.delete(country)
                            } else {
                              newCountries.add(country)
                            }
                            setSelectedCountries(newCountries)
                          }}
                        >
                          <span>{country}</span>
                          {selectedCountries.has(country) && <span className="checkmark">✓</span>}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item no-results">No countries found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cities Search Dropdown */}
            <div className="filter-section">
              <label className="filter-label">Cities</label>
              <div className="search-dropdown-container">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    onFocus={() => setShowCityDropdown(true)}
                    className="search-dropdown-input"
                  />
                  {citySearch && (
                    <button 
                      onClick={() => setCitySearch("")}
                      className="clear-search-btn"
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button 
                    className="dropdown-toggle"
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                  >
                    <FaChevronDown />
                  </button>
                </div>
                
                {showCityDropdown && (
                  <div className="dropdown-list">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <div
                          key={city}
                          className={`dropdown-item ${selectedCities.has(city) ? 'selected' : ''}`}
                          onClick={() => {
                            const newCities = new Set(selectedCities)
                            if (newCities.has(city)) {
                              newCities.delete(city)
                            } else {
                              newCities.add(city)
                            }
                            setSelectedCities(newCities)
                          }}
                        >
                          <span>{city}</span>
                          {selectedCities.has(city) && <span className="checkmark">✓</span>}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item no-results">No cities found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Types Search Dropdown */}
            <div className="filter-section">
              <label className="filter-label">Story Types</label>
              <div className="search-dropdown-container">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search types..."
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    onFocus={() => setShowTypeDropdown(true)}
                    className="search-dropdown-input"
                  />
                  {typeSearch && (
                    <button 
                      onClick={() => setTypeSearch("")}
                      className="clear-search-btn"
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button 
                    className="dropdown-toggle"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <FaChevronDown />
                  </button>
                </div>
                
                {showTypeDropdown && (
                  <div className="dropdown-list">
                    {filteredTypes.length > 0 ? (
                      filteredTypes.map((type) => (
                        <div
                          key={type}
                          className={`dropdown-item ${selectedTypes.has(type) ? 'selected' : ''}`}
                          onClick={() => {
                            const newTypes = new Set(selectedTypes)
                            if (newTypes.has(type)) {
                              newTypes.delete(type)
                            } else {
                              newTypes.add(type)
                            }
                            setSelectedTypes(newTypes)
                          }}
                        >
                          <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                          {selectedTypes.has(type) && <span className="checkmark">✓</span>}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item no-results">No types found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-actions">
              <button 
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedCountries(new Set())
                  setSelectedCities(new Set())
                  setSelectedTypes(new Set())
                  setCountrySearch("")
                  setCitySearch("")
                  setTypeSearch("")
                }}
              >
                Reset All
              </button>
              <button 
                className="apply-filter-btn"
                onClick={() => {
                  setShowFilterModal(false)
                  setShowCountryDropdown(false)
                  setShowCityDropdown(false)
                  setShowTypeDropdown(false)
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <main className="ig-feed">
        {displayStories.map((story) => {
          const isLiked = likedStories.has(story.id)
          const isSaved = savedStories.has(story.id)

          const handleStoryClick = (e) => {
            // Don't navigate if clicking on action buttons
            if (e.target.closest('button')) {
              return
            }
            navigate(`/stories/${story.id}`)
          }

          return (
            <article 
              key={story.id} 
              className="ig-post"
              onClick={handleStoryClick}
              style={{ cursor: 'pointer' }}
            >
              {/* Post Header */}
              <div className="ig-post-header">
                <div className="ig-user">
                  <div className="ig-avatar">{story.user?.name?.charAt(0).toUpperCase() || "A"}</div>
                  <div>
                    <p className="ig-username">{story.user?.name || "Anonymous"}</p>
                    <p className="ig-location">{story.location}</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="ig-image-wrapper">
                <img src={story.image || "https://via.placeholder.com/600"} alt={story.title} />
              </div>

              {/* Actions */}
              <div className="ig-actions">
                <button onClick={() => handleLike(story.id, isLiked)}>
                  {isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
                </button>

                <button onClick={() => handleSave(story.id, isSaved)}>
                  {isSaved ? <FaBookmark className="saved" /> : <FaRegBookmark />}
                </button>
              </div>

              {/* Caption */}
              <div className="ig-caption">
                <span>{story.user?.name}</span> {story.content}
              </div>
            </article>
          )
        })}
      </main>

      {/* Pagination */}
      {totalPages > 1 && selectedCountries.size === 0 && selectedCities.size === 0 && selectedTypes.size === 0 && (
        <div className="ig-pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            ← Prev
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}