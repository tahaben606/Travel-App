import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Mail, Lock, User, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const Signup = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!nom || !email || !motDePasse || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (motDePasse.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (motDePasse !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Use absolute URL to backend
      const apiUrl = 'http://localhost:8000/api/auth/register';
      console.log('Attempting to register at:', apiUrl);
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('nom', nom);
      formData.append('email', email);
      formData.append('mot_de_passe', motDePasse);
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      // Try to parse the response even if it's an error
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        // Handle Laravel validation errors
        if (data.errors) {
          const firstError = Object.values(data.errors)[0][0];
          throw new Error(firstError);
        }
        throw new Error(data.message || `Registration failed (${response.status})`);
      }

      // Backend returns { success, token, user: { id, name, email, created_at } }
      const user = data.user;
      const token = data.token;
      
      // Prepare user data 
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      // Store in context and localStorage
      login(userData, token);
      
      toast.success(`Account created successfully! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Full signup error:', error);
      
      // More specific error messages
      if (error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Make sure Laravel is running on port 8000.');
      } else if (error.message.includes('NetworkError')) {
        toast.error('Network error. Check your connection and Laravel CORS configuration.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <MapPin size={32} />
            <h1>Start Your Journey</h1>
            <p>Create an account to document your adventures</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Your name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
              <small className="password-hint">Minimum 6 characters</small>
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="form-group photo-upload-group">
              <label htmlFor="profilePhoto">
                Profile Photo (Optional)
              </label>
              <div className="photo-upload-wrapper">
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Profile preview" />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => {
                        setProfilePhoto(null);
                        setPhotoPreview(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={loading}
                  className="file-input"
                />
                <label htmlFor="profilePhoto" className="file-input-label">
                  {photoPreview ? 'Change Photo' : 'Choose Photo'}
                </label>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
            <Link to="/" className="back-link">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;