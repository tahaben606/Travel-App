import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '../styles/timeline.css';

const Timeline = ({ story, onAddEntry, onUpdate }) => {
  const [entries, setEntries] = useState(story.timeline || []);

  useEffect(() => {
    setEntries(story.timeline || []);
  }, [story]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: '',
    title: '',
    description: '',
    location: '',
  });

  const handleAddEntry = () => {
    if (!newEntry.date || !newEntry.title) {
      toast.error('Please fill in date and title');
      return;
    }

    const entry = {
      id: Date.now().toString(),
      ...newEntry,
      createdAt: new Date().toISOString(),
    };

    const updated = [...entries, entry].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setEntries(updated);
    onAddEntry(entry);
    setNewEntry({ date: '', title: '', description: '', location: '' });
    setShowAddForm(false);
    toast.success('Timeline entry added!');
  };

  const handleDeleteEntry = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
    toast.success('Entry deleted');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Day-by-Day Adventure</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Entry
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="add-entry-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3>New Timeline Entry</h3>
            <div className="form-group">
              <label>
                <Calendar size={16} />
                Date
              </label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FileText size={16} />
                Title
              </label>
              <input
                type="text"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="What happened today?"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <MapPin size={16} />
                Location
              </label>
              <input
                type="text"
                value={newEntry.location}
                onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                placeholder="Where were you?"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Tell us about your day..."
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button onClick={handleAddEntry} className="btn btn-primary">
                Add Entry
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewEntry({ date: '', title: '', description: '', location: '' });
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 ? (
        <div className="empty-timeline">
          <Calendar size={48} />
          <p>No timeline entries yet. Start documenting your journey!</p>
        </div>
      ) : (
        <div className="timeline-entries">
          {entries.map((entry, idx) => (
            <motion.div
              key={entry.id}
              className="timeline-entry"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="timeline-marker" />
              <div className="timeline-content">
                <div className="entry-header">
                  <div>
                    <h3>{entry.title}</h3>
                    <div className="entry-meta">
                      <span className="entry-date">
                        <Calendar size={14} />
                        {formatDate(entry.date)}
                      </span>
                      {entry.location && (
                        <span className="entry-location">
                          <MapPin size={14} />
                          {entry.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="delete-entry"
                  >
                    <X size={18} />
                  </button>
                </div>
                {entry.description && (
                  <p className="entry-description">{entry.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;

