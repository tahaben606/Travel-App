import { createContext, useContext, useState, useEffect } from 'react';

const StoriesContext = createContext(null);

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within StoriesProvider');
  }
  return context;
};

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Load stories from localStorage
    const stored = localStorage.getItem('travel_stories');
    if (stored) {
      setStories(JSON.parse(stored));
    }
  }, []);

  const saveStories = (newStories) => {
    setStories(newStories);
    localStorage.setItem('travel_stories', JSON.stringify(newStories));
  };

  const addStory = (story) => {
    const newStory = {
      ...story,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...stories, newStory];
    saveStories(updated);
    return newStory;
  };

  const updateStory = (id, updates) => {
    const updated = stories.map((story) =>
      story.id === id ? { ...story, ...updates } : story
    );
    saveStories(updated);
  };

  const deleteStory = (id) => {
    const updated = stories.filter((story) => story.id !== id);
    saveStories(updated);
  };

  const getStory = (id) => {
    return stories.find((story) => story.id === id);
  };

  const value = {
    stories,
    addStory,
    updateStory,
    deleteStory,
    getStory,
  };

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};

