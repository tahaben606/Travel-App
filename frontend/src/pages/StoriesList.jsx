"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaSearch,
  FaFilter,
  FaTimes
} from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import locationsData from "../data/locations.json"
import "./StoriesList.css"

const MAX_IN_MEMORY = 40

export default function StoriesList() {
  const navigate = useNavigate()
  const { token, isAuthenticated } = useAuth()

  /* =========================
     DATA STATES
  ========================== */
  const [stories, setStories] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [likedStories, setLikedStories] = useState(new Set())
  const [savedStories, setSavedStories] = useState(new Set())

  /* =========================
     FILTER STATES
  ========================== */
  const [selectedCountries, setSelectedCountries] = useState(new Set())
  const [selectedCities, setSelectedCities] = useState(new Set())
  const [selectedTypes, setSelectedTypes] = useState(new Set())
  
  // Temp filter states (not applied yet)
  const [tempCountries, setTempCountries] = useState(new Set())
  const [tempCities, setTempCities] = useState(new Set())
  const [tempTypes, setTempTypes] = useState(new Set())

  const [countrySearch, setCountrySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [typeSearch, setTypeSearch] = useState("")

  const observer = useRef(null)

  /* =========================
     AVAILABLE FILTER DATA
  ========================== */
  const availableCountries = useMemo(
    () => locationsData.locations.map(l => l.c),
    []
  )

  const availableCities = useMemo(
    () =>
      [
        ...new Set(
          locationsData.locations.flatMap(l => l.ct || [])
        )
      ],
    []
  )

  const availableTypes = locationsData.types

  /* =========================
     INITIALIZE TEMP FILTERS
  ========================== */
  useEffect(() => {
    // Initialize temp filters with current applied filters
    setTempCountries(selectedCountries)
    setTempCities(selectedCities)
    setTempTypes(selectedTypes)
  }, [])

  /* =========================
     LIKE / SAVE HANDLERS
  ========================== */
  const handleLike = async (e, id, liked) => {
    e.stopPropagation()
    if (!token) return alert("Login required")

    try {
      await axios.post(
        `http://localhost:8000/api/stories/${id}/${liked ? "unlike" : "like"}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setLikedStories(prev => {
        const s = new Set(prev)
        liked ? s.delete(id) : s.add(id)
        return s
      })
    } catch (err) {
      console.error("Error liking story:", err)
    }
  }

  const handleSave = async (e, id, saved) => {
    e.stopPropagation()
    if (!token) return alert("Login required")

    try {
      await axios.post(
        `http://localhost:8000/api/stories/${id}/${saved ? "unsave" : "save"}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSavedStories(prev => {
        const s = new Set(prev)
        saved ? s.delete(id) : s.add(id)
        return s
      })
    } catch (err) {
      console.error("Error saving story:", err)
    }
  }

  /* =========================
     FETCH STORIES
  ========================== */
  const fetchStories = useCallback(async (isRefresh = false) => {
    if (loading && !isRefresh) return
    setLoading(true)
    
    try {
      const res = await axios.get(
        `http://localhost:8000/api/stories?page=${isRefresh ? 1 : page}`
      )

      const newStories = res.data.stories.data || []

      if (isRefresh) {
        setStories(newStories)
        setPage(2) // Reset to page 2 since we loaded page 1
      } else {
        setStories(prev => {
          const merged = [...prev, ...newStories]
          // Keep unique stories by id
          const uniqueStories = merged.reduce((acc, current) => {
            const x = acc.find(item => item.id === current.id)
            if (!x) {
              return acc.concat([current])
            } else {
              return acc
            }
          }, [])
          return uniqueStories.slice(-MAX_IN_MEMORY)
        })
        setPage(p => p + 1)
      }

      setHasMore((isRefresh ? 1 : page) < res.data.stories.last_page)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      if (isRefresh) {
        setRefreshing(false)
      }
    }
  }, [loading, page])

  // Initial fetch
  useEffect(() => {
    fetchStories(true)
  }, [])

  /* =========================
     INFINITE SCROLL
  ========================== */
  const lastStoryRef = useCallback(
    node => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchStories()
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore, fetchStories]
  )

  /* =========================
     USER INTERACTIONS
  ========================== */
  useEffect(() => {
    if (!isAuthenticated || !token) return

    Promise.all([
      axios.get("http://localhost:8000/api/profile/liked-stories", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:8000/api/profile/saved-stories", {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]).then(([liked, saved]) => {
      setLikedStories(new Set(liked.data.stories?.data?.map(s => s.id) || []))
      setSavedStories(new Set(saved.data.stories?.data?.map(s => s.id) || []))
    })
  }, [token, isAuthenticated])

  /* =========================
     FILTER LOGIC
  ========================== */
  const filteredStories = useMemo(() => {
    if (selectedCountries.size === 0 && selectedCities.size === 0 && selectedTypes.size === 0) {
      return stories
    }

    return stories.filter(story => {
      let countryMatch = true
      let cityMatch = true
      let typeMatch = true

      // Country Filter
      if (selectedCountries.size > 0) {
        countryMatch = false
        if (story.location) {
          const locationParts = story.location.split(",").map(part => part.trim())
          const country = locationParts[locationParts.length - 1]
          countryMatch = selectedCountries.has(country)
        }
      }

      // City Filter
      if (selectedCities.size > 0) {
        cityMatch = false
        if (story.location) {
          const locationParts = story.location.split(",").map(part => part.trim())
          const city = locationParts[0]
          cityMatch = selectedCities.has(city)
        }
      }

      // Type Filter
      if (selectedTypes.size > 0) {
        typeMatch = false
        const storyType = (story.type || "other").toLowerCase()
        selectedTypes.forEach(selectedType => {
          if (storyType === selectedType.toLowerCase()) {
            typeMatch = true
          }
        })
      }

      if (selectedCountries.size > 0 && selectedCities.size > 0) {
        return (countryMatch || cityMatch) && typeMatch
      }
      
      return countryMatch && cityMatch && typeMatch
    })
  }, [stories, selectedCountries, selectedCities, selectedTypes])

  /* =========================
     FILTER HELPER FUNCTIONS
  ========================== */
  const toggleTempCountry = (country) => {
    const newCountries = new Set(tempCountries)
    if (newCountries.has(country)) {
      newCountries.delete(country)
    } else {
      newCountries.add(country)
    }
    setTempCountries(newCountries)
  }

  const toggleTempCity = (city) => {
    const newCities = new Set(tempCities)
    if (newCities.has(city)) {
      newCities.delete(city)
    } else {
      newCities.add(city)
    }
    setTempCities(newCities)
  }

  const toggleTempType = (type) => {
    const newTypes = new Set(tempTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setTempTypes(newTypes)
  }

  const applyFilters = () => {
    // Apply temp filters to actual filters
    setSelectedCountries(tempCountries)
    setSelectedCities(tempCities)
    setSelectedTypes(tempTypes)
    
    // Reset pagination and refresh stories
    setRefreshing(true)
    fetchStories(true)
  }

  const resetFilters = () => {
    setTempCountries(new Set())
    setTempCities(new Set())
    setTempTypes(new Set())
    setCountrySearch("")
    setCitySearch("")
    setTypeSearch("")
  }

  const clearAllAppliedFilters = () => {
    setSelectedCountries(new Set())
    setSelectedCities(new Set())
    setSelectedTypes(new Set())
    resetFilters()
    setRefreshing(true)
    fetchStories(true)
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="ig-page">
      {/* SIDEBAR */}
      <aside className="side-filter">
        <div className="filter-header">
          <h3>
            <FaFilter style={{ marginRight: '8px' }} />
            Filters
          </h3>
          {(tempCountries.size > 0 || tempCities.size > 0 || tempTypes.size > 0) && (
            <button className="reset-btn-small" onClick={resetFilters}>
              <FaTimes /> Clear
            </button>
          )}
        </div>

        {/* Applied Filters Display */}
        {(selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0) && (
          <div className="applied-filters-section">
            <h4>Applied Filters:</h4>
            <div className="selected-filters">
              {Array.from(selectedCountries).map(country => (
                <span key={country} className="filter-chip applied">
                  {country}
                  <button 
                    onClick={() => {
                      const newSet = new Set(selectedCountries)
                      newSet.delete(country)
                      setSelectedCountries(newSet)
                      setTempCountries(newSet)
                      setRefreshing(true)
                      fetchStories(true)
                    }} 
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              ))}
              {Array.from(selectedCities).map(city => (
                <span key={city} className="filter-chip applied">
                  {city}
                  <button 
                    onClick={() => {
                      const newSet = new Set(selectedCities)
                      newSet.delete(city)
                      setSelectedCities(newSet)
                      setTempCities(newSet)
                      setRefreshing(true)
                      fetchStories(true)
                    }} 
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              ))}
              {Array.from(selectedTypes).map(type => (
                <span key={type} className="filter-chip applied">
                  {type}
                  <button 
                    onClick={() => {
                      const newSet = new Set(selectedTypes)
                      newSet.delete(type)
                      setSelectedTypes(newSet)
                      setTempTypes(newSet)
                      setRefreshing(true)
                      fetchStories(true)
                    }} 
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button 
              className="clear-all-btn" 
              onClick={clearAllAppliedFilters}
            >
              Clear All Applied Filters
            </button>
          </div>
        )}

        {/* Temp Filters Display */}
        {(tempCountries.size > 0 || tempCities.size > 0 || tempTypes.size > 0) && (
          <div className="temp-filters-section">
            <h4>Selected (Not Applied):</h4>
            <div className="selected-filters">
              {Array.from(tempCountries).map(country => (
                <span key={country} className="filter-chip temp">
                  {country}
                  <button onClick={() => toggleTempCountry(country)} className="remove-filter">
                    ×
                  </button>
                </span>
              ))}
              {Array.from(tempCities).map(city => (
                <span key={city} className="filter-chip temp">
                  {city}
                  <button onClick={() => toggleTempCity(city)} className="remove-filter">
                    ×
                  </button>
                </span>
              ))}
              {Array.from(tempTypes).map(type => (
                <span key={type} className="filter-chip temp">
                  {type}
                  <button onClick={() => toggleTempType(type)} className="remove-filter">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Country Filter */}
        <div className="filter-block">
          <label>Country</label>
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search country..."
              value={countrySearch}
              onChange={e => setCountrySearch(e.target.value)}
            />
          </div>
          <div className="filter-list">
            {availableCountries
              .filter(country => 
                country.toLowerCase().includes(countrySearch.toLowerCase())
              )
              .map(country => (
                <div
                  key={country}
                  className={`filter-item ${tempCountries.has(country) ? "active" : ""}`}
                  onClick={() => toggleTempCountry(country)}
                >
                  {country}
                  {tempCountries.has(country) && <span className="checkmark">✓</span>}
                </div>
              ))}
          </div>
        </div>

        {/* City Filter */}
        <div className="filter-block">
          <label>City</label>
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search city..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
            />
          </div>
          <div className="filter-list">
            {availableCities
              .filter(city => 
                city.toLowerCase().includes(citySearch.toLowerCase())
              )
              .map(city => (
                <div
                  key={city}
                  className={`filter-item ${tempCities.has(city) ? "active" : ""}`}
                  onClick={() => toggleTempCity(city)}
                >
                  {city}
                  {tempCities.has(city) && <span className="checkmark">✓</span>}
                </div>
              ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="filter-block">
          <label>Type</label>
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search type..."
              value={typeSearch}
              onChange={e => setTypeSearch(e.target.value)}
            />
          </div>
          <div className="filter-list">
            {availableTypes
              .filter(type => 
                type.toLowerCase().includes(typeSearch.toLowerCase())
              )
              .map(type => (
                <div
                  key={type}
                  className={`filter-item ${tempTypes.has(type) ? "active" : ""}`}
                  onClick={() => toggleTempType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {tempTypes.has(type) && <span className="checkmark">✓</span>}
                </div>
              ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="filter-actions">
          <button 
            className="reset-btn" 
            onClick={resetFilters}
            disabled={tempCountries.size === 0 && tempCities.size === 0 && tempTypes.size === 0}
          >
            Clear Selection
          </button>
          <button 
            className="apply-btn" 
            onClick={applyFilters}
            disabled={tempCountries.size === 0 && tempCities.size === 0 && tempTypes.size === 0}
          >
            {refreshing ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </aside>

      {/* FEED */}
      <main className="ig-feed">
        {/* Refresh Indicator */}
        {refreshing && (
          <div className="refresh-indicator">
            <div className="spinner"></div>
            Refreshing stories...
          </div>
        )}

        {filteredStories.length > 0 ? (
          filteredStories.map((story, i) => {
            const isLiked = likedStories.has(story.id)
            const isSaved = savedStories.has(story.id)

            return (
              <article
                key={story.id}
                ref={i === filteredStories.length - 1 ? lastStoryRef : null}
                className="ig-post clickable-card"
                onClick={() => navigate(`/stories/${story.id}`)}
              >
                <div className="ig-post-header">
                  <div className="ig-avatar">
                    {story.user?.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="ig-username">{story.user?.name || "Anonymous"}</p>
                    <p className="ig-location">{story.location || "Unknown location"}</p>
                  </div>
                </div>

                <img 
                  src={story.image || "https://via.placeholder.com/600"} 
                  alt={story.title || "Story"} 
                  loading="lazy" 
                  className="story-image"
                />

                <div className="ig-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => handleLike(e, story.id, isLiked)} 
                    title={isLiked ? "Unlike" : "Like"}
                    className="action-btn"
                  >
                    {isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
                  </button>
                  <button 
                    onClick={(e) => handleSave(e, story.id, isSaved)} 
                    title={isSaved ? "Unsave" : "Save"}
                    className="action-btn"
                  >
                    {isSaved ? <FaBookmark className="saved" /> : <FaRegBookmark />}
                  </button>
                </div>

                <div className="ig-caption">
                  <span className="username-bold">{story.user?.name || "Anonymous"}</span> 
                  {story.content?.substring(0, 150) || "No description..."}
                  {story.content?.length > 150 && "..."}
                </div>
              </article>
            )
          })
        ) : (
          <div className="no-stories">
            <div className="no-stories-icon">📭</div>
            <p className="no-stories-title">No stories found</p>
            <p className="no-stories-text">
              {(selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0)
                ? "No stories match your filters. Try adjusting them."
                : "No stories available at the moment"}
            </p>
            {(selectedCountries.size > 0 || selectedCities.size > 0 || selectedTypes.size > 0) && (
              <button
                className="reset-btn-inline"
                onClick={clearAllAppliedFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {loading && !refreshing && <div className="ig-loading">Loading more stories...</div>}
      </main>
    </div>
  )
}