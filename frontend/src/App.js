import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { StoriesProvider } from './context/StoriesContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/landing';
import Navbar from './components/PillNav';
import Dashboard from './pages/Dashboard';
import StoryDetail from './pages/StoryDetail';
import StoriesList from './pages/StoriesList';
import CreateStory from './pages/CreateStory';
import About from './pages/About';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StoriesFeed from './components/StoriesFeed';
import Profile from './pages/Profile';


// Styles
import './App.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <StoriesProvider>
        <Router>
          <Navbar />
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Stories Routes */}
              <Route 
                path="/stories" 
                element={<StoriesList />}
              />
              <Route
                path="/stories/:id"
                element={<StoryDetail />}
              />
              <Route
                path="/stories/create"
                element={
                  <ProtectedRoute>
                    <CreateStory />
                  </ProtectedRoute>
                }
              />
              {/* Instagram Feed Route */}
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <StoriesFeed />
                  </ProtectedRoute>
                }
              />
              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </StoriesProvider>
    </AuthProvider>
  )
}

export default App;
