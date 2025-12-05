import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStories } from '../context/StoriesContext';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/story-form.css';

const StoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addStory, updateStory, getStory } = useStories();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: '',
  });

  useEffect(() => {
    if (isEditing) {
      const story = getStory(id);
      if (story) {
        setFormData({
          title: story.title || '',
          destination: story.destination || '',
          description: story.description || '',
          startDate: story.startDate || '',
          endDate: story.endDate || '',
          coverImage: story.coverImage || '',
        });
      }
    }
  }, [id, isEditing, getStory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.destination) {
      toast.error('Please fill in title and destination');
      return;
    }

    if (isEditing) {
      updateStory(id, formData);
      toast.success('Story updated!');
    } else {
      addStory(formData);
      toast.success('Story created!');
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="story-form-page">
      <div className="story-form-container">
        <div className="form-header">
          <h1>{isEditing ? 'Edit Story' : 'Create New Story'}</h1>
          <button onClick={() => navigate('/dashboard')} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="story-form">
          <div className="form-section">
            <label>Story Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="My Amazing Trip to Japan"
              required
            />
          </div>

          <div className="form-section">
            <label>Destination *</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Tokyo, Japan"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-section">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-section">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your adventure..."
              rows={5}
            />
          </div>

          <div className="form-section">
            <label>Cover Image</label>
            <div className="image-upload">
              {formData.coverImage ? (
                <div className="image-preview">
                  <img src={formData.coverImage} alt="Cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                    className="remove-image"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <span>📷</span>
                    <span>Click to upload cover image</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={20} />
              <span>{isEditing ? 'Update Story' : 'Create Story'}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryForm;

