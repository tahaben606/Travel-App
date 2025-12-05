import { Link } from 'react-router-dom';
import { useStories } from '../context/StoriesContext';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Image, ArrowRight } from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { stories } = useStories();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Your Travel Stories</h1>
            <p>Document your adventures and relive every moment</p>
          </div>
          <Link to="/stories/new" className="btn btn-primary">
            <Plus size={20} />
            <span>New Story</span>
          </Link>
        </div>

        {stories.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MapPin size={64} />
            <h2>No stories yet</h2>
            <p>Start documenting your first adventure!</p>
            <Link to="/stories/new" className="btn btn-primary btn-lg">
              <Plus size={24} />
              <span>Create Your First Story</span>
            </Link>
          </motion.div>
        ) : (
          <div className="stories-grid">
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                className="story-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {story.coverImage && (
                  <div className="story-cover">
                    <img src={story.coverImage} alt={story.title} />
                  </div>
                )}
                <div className="story-content">
                  <h3>{story.title}</h3>
                  <p className="story-location">
                    <MapPin size={16} />
                    {story.destination}
                  </p>
                  <p className="story-description">{story.description}</p>
                  <div className="story-meta">
                    <span className="story-date">
                      <Calendar size={14} />
                      {formatDate(story.startDate)} - {formatDate(story.endDate)}
                    </span>
                    {story.photos && story.photos.length > 0 && (
                      <span className="story-photos">
                        <Image size={14} />
                        {story.photos.length} photos
                      </span>
                    )}
                  </div>
                  <Link to={`/stories/${story.id}`} className="story-link">
                    View Story <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

