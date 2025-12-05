import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStories } from '../context/StoriesContext';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Edit, Trash2, Plus, Image, Map, Clock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import MapView from '../components/MapView';
import Timeline from '../components/Timeline';
import PhotoGallery from '../components/PhotoGallery';
import '../styles/story-detail.css';

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStory, deleteStory, updateStory } = useStories();
  const [story, setStory] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    const storyData = getStory(id);
    if (!storyData) {
      toast.error('Story not found');
      navigate('/dashboard');
      return;
    }
    setStory(storyData);
  }, [id, getStory, navigate]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      deleteStory(id);
      toast.success('Story deleted');
      navigate('/dashboard');
    }
  };

  const addPhoto = (photo) => {
    if (!story) return;
    const updatedPhotos = [...(story.photos || []), photo];
    const updatedStory = { ...story, photos: updatedPhotos };
    updateStory(id, updatedStory);
    setStory(updatedStory);
  };

  const updatePhotos = (updatedPhotos) => {
    if (!story) return;
    const updatedStory = { ...story, photos: updatedPhotos };
    updateStory(id, updatedStory);
    setStory(updatedStory);
  };

  const addTimelineEntry = (entry) => {
    if (!story) return;
    const updatedEntries = [...(story.timeline || []), entry].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const updatedStory = { ...story, timeline: updatedEntries };
    updateStory(id, updatedStory);
    setStory(updatedStory);
  };

  const updateTimeline = (updatedEntries) => {
    if (!story) return;
    const updatedStory = { ...story, timeline: updatedEntries };
    updateStory(id, updatedStory);
    setStory(updatedStory);
  };

  if (!story) {
    return <div className="loading">Loading...</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="story-detail-page">
      <div className="story-detail-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-actions">
          <Link to={`/stories/${id}/edit`} className="btn btn-outline">
            <Edit size={18} />
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="story-hero">
        {story.coverImage && (
          <div className="story-cover-image">
            <img src={story.coverImage} alt={story.title} />
          </div>
        )}
        <div className="story-hero-content">
          <h1>{story.title}</h1>
          <div className="story-meta-info">
            <span>
              <MapPin size={18} />
              {story.destination}
            </span>
            <span>
              <Calendar size={18} />
              {formatDate(story.startDate)} - {formatDate(story.endDate)}
            </span>
          </div>
          {story.description && <p className="story-description">{story.description}</p>}
        </div>
      </div>

      <div className="story-tabs">
        <button
          className={activeTab === 'timeline' ? 'active' : ''}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={18} />
          Timeline
        </button>
        <button
          className={activeTab === 'map' ? 'active' : ''}
          onClick={() => setActiveTab('map')}
        >
          <Map size={18} />
          Map
        </button>
        <button
          className={activeTab === 'photos' ? 'active' : ''}
          onClick={() => setActiveTab('photos')}
        >
          <Image size={18} />
          Photos ({story.photos?.length || 0})
        </button>
      </div>

      <div className="story-content">
        {activeTab === 'timeline' && (
          <Timeline story={story} onAddEntry={addTimelineEntry} onUpdate={updateTimeline} />
        )}
        {activeTab === 'map' && <MapView story={story} onUpdate={(markers) => {
          if (!story) return;
          const updatedStory = { ...story, markers };
          updateStory(id, updatedStory);
          setStory(updatedStory);
        }} />}
        {activeTab === 'photos' && <PhotoGallery story={story} onAddPhoto={addPhoto} onUpdate={updatePhotos} />}
      </div>
    </div>
  );
};

export default StoryDetail;

