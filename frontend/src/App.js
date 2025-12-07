import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { StoriesProvider } from './context/StoriesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

// Pages
import Landing from './pages/landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import StoryForm from './pages/StoryForm';
import StoryDetail from './pages/StoryDetail';
import PackingLists from './pages/PackingLists';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';

import './App.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <StoriesProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Header />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/new"
                element={
                  <ProtectedRoute>
                    <StoryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/:id"
                element={
                  <ProtectedRoute>
                    <StoryDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/:id/edit"
                element={
                  <ProtectedRoute>
                    <StoryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packing"
                element={
                  <ProtectedRoute>
                    <PackingLists />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </StoriesProvider>
    </AuthProvider>
  );
}

export default App;
