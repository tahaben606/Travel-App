import { useState, useEffect } from 'react';
import { Plus, Image, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '../styles/photo-gallery.css';

const PhotoGallery = ({ story, onAddPhoto, onUpdate }) => {
  const [photos, setPhotos] = useState(story.photos || []);

  useEffect(() => {
    setPhotos(story.photos || []);
  }, [story]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ file: null, caption: '', location: '' });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto({ ...newPhoto, file: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (!newPhoto.file) {
      toast.error('Please select an image');
      return;
    }

    const photo = {
      id: Date.now().toString(),
      url: newPhoto.file,
      caption: newPhoto.caption,
      location: newPhoto.location,
      date: new Date().toISOString(),
    };

    const updated = [...photos, photo];
    setPhotos(updated);
    onAddPhoto(photo);
    setNewPhoto({ file: null, caption: '', location: '' });
    setShowUpload(false);
    toast.success('Photo added!');
  };

  const handleDeletePhoto = (id) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
    toast.success('Photo deleted');
  };

  return (
    <div className="photo-gallery-container">
      <div className="gallery-header">
        <h2>Photo Gallery</h2>
        <button onClick={() => setShowUpload(!showUpload)} className="btn btn-primary">
          <Plus size={18} />
          Add Photo
        </button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="upload-photo-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3>Upload New Photo</h3>
            <div className="upload-preview">
              {newPhoto.file ? (
                <img src={newPhoto.file} alt="Preview" />
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <Image size={32} />
                    <span>Click to select image</span>
                  </div>
                </label>
              )}
            </div>
            <div className="form-group">
              <label>Caption</label>
              <input
                type="text"
                value={newPhoto.caption}
                onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                placeholder="What's happening in this photo?"
              />
            </div>
            <div className="form-group">
              <label>
                <MapPin size={16} />
                Location
              </label>
              <input
                type="text"
                value={newPhoto.location}
                onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                placeholder="Where was this taken?"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleAddPhoto} className="btn btn-primary">
                Add Photo
              </button>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setNewPhoto({ file: null, caption: '', location: '' });
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {photos.length === 0 ? (
        <div className="empty-gallery">
          <Image size={64} />
          <p>No photos yet. Start capturing your memories!</p>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              className="photo-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.url} alt={photo.caption || 'Photo'} />
              <div className="photo-overlay">
                {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                {photo.location && (
                  <p className="photo-location">
                    <MapPin size={14} />
                    {photo.location}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
                className="delete-photo"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="photo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="close-modal"
              >
                <X size={24} />
              </button>
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} />
              <div className="modal-info">
                {selectedPhoto.caption && <h3>{selectedPhoto.caption}</h3>}
                {selectedPhoto.location && (
                  <p>
                    <MapPin size={16} />
                    {selectedPhoto.location}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;

