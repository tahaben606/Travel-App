import { useState, useEffect } from 'react';
import { useStories } from '../context/StoriesContext';
import { motion } from 'framer-motion';
import { Plus, Check, X, Luggage, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/packing-lists.css';

const PackingLists = () => {
  const { stories } = useStories();
  const [lists, setLists] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newList, setNewList] = useState({ name: '', storyId: '' });

  useEffect(() => {
    // Load packing lists from localStorage
    const stored = localStorage.getItem('travel_packing_lists');
    if (stored) {
      setLists(JSON.parse(stored));
    }
  }, []);

  const saveLists = (updatedLists) => {
    setLists(updatedLists);
    localStorage.setItem('travel_packing_lists', JSON.stringify(updatedLists));
  };

  const createList = () => {
    if (!newList.name) {
      toast.error('Please enter a list name');
      return;
    }

    const list = {
      id: Date.now().toString(),
      name: newList.name,
      storyId: newList.storyId || null,
      items: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...lists, list];
    saveLists(updated);
    setNewList({ name: '', storyId: '' });
    setShowAddForm(false);
    toast.success('Packing list created!');
  };

  const deleteList = (id) => {
    if (window.confirm('Delete this packing list?')) {
      const updated = lists.filter((l) => l.id !== id);
      saveLists(updated);
      toast.success('List deleted');
    }
  };

  const addItem = (listId, itemName) => {
    if (!itemName.trim()) return;

    const item = {
      id: Date.now().toString(),
      name: itemName,
      packed: false,
    };

    const updated = lists.map((list) =>
      list.id === listId
        ? { ...list, items: [...list.items, item] }
        : list
    );
    saveLists(updated);
  };

  const toggleItem = (listId, itemId) => {
    const updated = lists.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, packed: !item.packed } : item
            ),
          }
        : list
    );
    saveLists(updated);
  };

  const deleteItem = (listId, itemId) => {
    const updated = lists.map((list) =>
      list.id === listId
        ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
        : list
    );
    saveLists(updated);
  };

  return (
    <div className="packing-lists-page">
      <div className="packing-lists-container">
        <div className="lists-header">
          <div>
            <h1>Packing Lists</h1>
            <p>Organize your travel essentials</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            <span>New List</span>
          </button>
        </div>

        {showAddForm && (
          <motion.div
            className="add-list-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Create New Packing List</h3>
            <input
              type="text"
              placeholder="List name (e.g., 'Japan Trip Essentials')"
              value={newList.name}
              onChange={(e) => setNewList({ ...newList, name: e.target.value })}
            />
            <select
              value={newList.storyId}
              onChange={(e) => setNewList({ ...newList, storyId: e.target.value })}
            >
              <option value="">No story (General list)</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button onClick={createList} className="btn btn-primary">
                Create List
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewList({ name: '', storyId: '' });
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {lists.length === 0 ? (
          <div className="empty-state">
            <Luggage size={64} />
            <h2>No packing lists yet</h2>
            <p>Create your first list to start organizing!</p>
          </div>
        ) : (
          <div className="lists-grid">
            {lists.map((list) => {
              const packedCount = list.items.filter((i) => i.packed).length;
              const totalCount = list.items.length;
              const story = stories.find((s) => s.id === list.storyId);

              return (
                <motion.div
                  key={list.id}
                  className="packing-list-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="list-header">
                    <div>
                      <h3>{list.name}</h3>
                      {story && (
                        <p className="list-story">{story.title}</p>
                      )}
                      {totalCount > 0 && (
                        <p className="list-progress">
                          {packedCount} / {totalCount} packed
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="delete-list-btn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <ItemInput
                    onAddItem={(itemName) => addItem(list.id, itemName)}
                  />

                  <div className="list-items">
                    {list.items.length === 0 ? (
                      <p className="empty-items">No items yet. Add some!</p>
                    ) : (
                      list.items.map((item) => (
                        <div
                          key={item.id}
                          className={`list-item ${item.packed ? 'packed' : ''}`}
                        >
                          <button
                            onClick={() => toggleItem(list.id, item.id)}
                            className="item-checkbox"
                          >
                            <Check size={16} />
                          </button>
                          <span className="item-name">{item.name}</span>
                          <button
                            onClick={() => deleteItem(list.id, item.id)}
                            className="delete-item-btn"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ItemInput = ({ onAddItem }) => {
  const [itemName, setItemName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (itemName.trim()) {
      onAddItem(itemName);
      setItemName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="item-input-form">
      <input
        type="text"
        placeholder="Add item..."
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <button type="submit" className="btn btn-sm btn-primary">
        <Plus size={16} />
      </button>
    </form>
  );
};

export default PackingLists;

