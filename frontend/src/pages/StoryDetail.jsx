"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FiArrowLeft, FiMapPin, FiCalendar, FiEdit2, FiTrash2, FiEye, FiHeart } from "react-icons/fi"
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa"
import axios from "axios"
import "./StoryDetail.css"

const StoryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const token = localStorage.getItem("token")
  const currentUser = token ? JSON.parse(localStorage.getItem("user") || "{}") : null

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/stories/${id}`)
        if (!response.ok) {
          throw new Error("Story not found")
        }
        const data = await response.json()
        setStory(data.story)

        // Increment views count
        await fetch(`http://localhost:8000/api/stories/${id}/increment-views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((err) => console.log("View count update:", err))

        // Check if user has liked/saved this story
        if (token) {
          try {
            const likedRes = await axios.get(`http://localhost:8000/api/stories/${id}/is-liked`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            setIsLiked(likedRes.data.is_liked)

            const savedRes = await axios.get(`http://localhost:8000/api/stories/${id}/is-saved`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            setIsSaved(savedRes.data.is_saved)
          } catch (err) {
            console.log("Error checking like/save status:", err)
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [id, token])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`http://localhost:8000/api/stories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete story")
      }

      navigate("/dashboard")
    } catch (err) {
      setError(err.message)
      setIsDeleting(false)
    }
  }

  const handleLike = async () => {
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const endpoint = isLiked
        ? `http://localhost:8000/api/stories/${id}/unlike`
        : `http://localhost:8000/api/stories/${id}/like`

      await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setIsLiked(!isLiked)
      setStory((prev) => ({
        ...prev,
        likedBy: isLiked
          ? (prev.likedBy || []).filter((u) => u.id !== currentUser?.id)
          : [...(prev.likedBy || []), { id: currentUser?.id }],
      }))
    } catch (err) {
      console.error("Error toggling like:", err)
    }
  }

  const handleSave = async () => {
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const endpoint = isSaved
        ? `http://localhost:8000/api/stories/${id}/unsave`
        : `http://localhost:8000/api/stories/${id}/save`

      await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setIsSaved(!isSaved)
    } catch (err) {
      console.error("Error toggling save:", err)
    }
  }

  if (loading) {
    return (
      <div className="story-loading">
        <div className="spinner"></div>
        <p>Loading your story...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
        <button onClick={() => navigate(-1)} className="back-btn-error">
          <FiArrowLeft /> Go Back
        </button>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="not-found">
        <h2>Story not found</h2>
        <p>The story you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/stories")} className="back-btn-error">
          <FiArrowLeft /> Back to Stories
        </button>
      </div>
    )
  }

  const isAuthor = currentUser && story.user_id === currentUser.id

  return (
    <div className="story-detail-wrapper">
      <motion.div
        className="story-detail-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="back-link-btn"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft /> Back
        </motion.button>

        <motion.article
          className="story-article"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Featured Image */}
          {story.image && (
            <motion.div
              className="story-featured-image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="image-overlay"></div>
              <img
                src={story.image.startsWith("http") ? story.image : `http://localhost:8000/storage/${story.image}`}
                alt={story.title}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://via.placeholder.com/1200x600/667eea/FFFFFF?text=No+Image"
                }}
              />
            </motion.div>
          )}

          {/* Content Container */}
          <div className="story-content-wrapper">
            {/* Header */}
            <header className="story-header">
              <div className="story-meta-section">
                <motion.h1
                  className="story-title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {story.title}
                </motion.h1>

                <motion.div
                  className="meta-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {story.location && (
                    <span className="meta-item location">
                      <FiMapPin size={16} /> {story.location}
                    </span>
                  )}
                  <span className="meta-item date">
                    <FiCalendar size={16} />{" "}
                    {new Date(story.published_at || story.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </motion.div>

                {/* Author Info */}
                <motion.div
                  className="author-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="author-avatar">{story.user?.name?.charAt(0).toUpperCase() || "A"}</div>
                  <div className="author-info">
                    <p className="author-name">{story.user?.name || "Anonymous"}</p>
                    <p className="author-bio">Travel Enthusiast</p>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                className="story-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {isAuthor ? (
                  <>
                    <Link to={`/stories/${story.id}/edit`} className="btn-icon btn-edit">
                      <FiEdit2 /> Edit
                    </Link>
                    <button onClick={handleDelete} className="btn-icon btn-delete" disabled={isDeleting}>
                      {isDeleting ? (
                        "Deleting..."
                      ) : (
                        <>
                          <FiTrash2 /> Delete
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <motion.button
                      className={`btn-icon btn-like ${isLiked ? "active" : ""}`}
                      onClick={handleLike}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isLiked ? <FaHeart /> : <FaRegHeart />}
                      <span className="btn-label">Like</span>
                    </motion.button>
                    <motion.button
                      className={`btn-icon btn-save ${isSaved ? "active" : ""}`}
                      onClick={handleSave}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                      <span className="btn-label">Save</span>
                    </motion.button>
                  </>
                )}
              </motion.div>
            </header>

            {/* Stats */}
            <motion.div
              className="story-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="stat">
                <FiEye size={18} />
                <span>{story.views || 0} views</span>
              </div>
              <div className="stat">
                <FiHeart size={18} />
                <span>{story.likedBy?.length || 0} likes</span>
              </div>
              <div className="stat">
                <FiMapPin size={18} />
                <span>{story.type ? story.type.charAt(0).toUpperCase() + story.type.slice(1) : "Story"}</span>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="story-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              dangerouslySetInnerHTML={{
                __html: story.content.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        </motion.article>
      </motion.div>
    </div>
  )
}

export default StoryDetail
