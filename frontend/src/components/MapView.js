import { useState, useEffect } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import '../styles/map-view.css';

const MapView = ({ story, onUpdate }) => {
  const [markers, setMarkers] = useState(story.markers || []);

  useEffect(() => {
    setMarkers(story.markers || []);
  }, [story]);
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [newMarker, setNewMarker] = useState({ name: '', lat: '', lng: '' });

  // Default center (you can make this dynamic based on story destination)
  const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // Tokyo default

  const handleAddMarker = () => {
    if (!newMarker.name || !newMarker.lat || !newMarker.lng) {
      toast.error('Please fill in all fields');
      return;
    }

    const marker = {
      id: Date.now().toString(),
      name: newMarker.name,
      lat: parseFloat(newMarker.lat),
      lng: parseFloat(newMarker.lng),
    };

    const updated = [...markers, marker];
    setMarkers(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
    setNewMarker({ name: '', lat: '', lng: '' });
    setShowAddMarker(false);
    toast.success('Marker added!');
  };

  const handleDeleteMarker = (id) => {
    const updated = markers.filter((m) => m.id !== id);
    setMarkers(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
    toast.success('Marker removed');
  };

  // Simple map visualization using CSS (in production, use Google Maps, Mapbox, etc.)
  return (
    <div className="map-view-container">
      <div className="map-controls">
        <button
          onClick={() => setShowAddMarker(!showAddMarker)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Marker
        </button>
        {markers.length > 0 && (
          <div className="markers-count">{markers.length} markers</div>
        )}
      </div>

      {showAddMarker && (
        <motion.div
          className="add-marker-form"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            placeholder="Location name"
            value={newMarker.name}
            onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Latitude"
            step="0.0001"
            value={newMarker.lat}
            onChange={(e) => setNewMarker({ ...newMarker, lat: e.target.value })}
          />
          <input
            type="number"
            placeholder="Longitude"
            step="0.0001"
            value={newMarker.lng}
            onChange={(e) => setNewMarker({ ...newMarker, lng: e.target.value })}
          />
          <div className="form-actions">
            <button onClick={handleAddMarker} className="btn btn-primary btn-sm">
              Add
            </button>
            <button
              onClick={() => {
                setShowAddMarker(false);
                setNewMarker({ name: '', lat: '', lng: '' });
              }}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="map-visualization">
        <div className="map-placeholder">
          <MapPin size={48} />
          <p>Map Visualization</p>
          <p className="map-note">
            In production, integrate with Google Maps, Mapbox, or Leaflet
          </p>
        </div>

        {markers.length > 0 && (
          <div className="markers-list">
            <h3>Markers</h3>
            {markers.map((marker) => (
              <div key={marker.id} className="marker-item">
                <div className="marker-info">
                  <MapPin size={16} />
                  <span>{marker.name}</span>
                  <span className="marker-coords">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteMarker(marker.id)}
                  className="delete-marker"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;

