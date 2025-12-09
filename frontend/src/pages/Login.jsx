import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = 'http://localhost:8000/api/auth/login';
      console.log('Logging in with:', { email, apiUrl });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Important for Laravel Sanctum/session cookies
        body: JSON.stringify({
          email: email,
          mot_de_passe: password, // Match your database column name
        }),
      });

      console.log('Response status:', response.status);
      
      // Get response as text first for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        console.error('Login API error:', data);
        
        // Handle Laravel validation errors
        if (data.errors) {
          const errors = Object.values(data.errors).flat();
          throw new Error(errors[0] || 'Validation failed');
        }
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      console.log('Login successful!', data);
      
      // Your Laravel should return client data and token
      const client = data.client || data.data;
      const token = data.token || data.access_token;
      
      // Prepare user data matching your database structure
      const userData = {
        id_client: client.id_client,
        nom: client.nom,
        email: client.email,
        date_inscription: client.date_inscription,
      };

      // Store in localStorage for persistence
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Update auth context
      login(userData, token);
      
      toast.success(`Welcome back, ${client.nom}!`);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Full login error:', error);
      
      // More specific error messages
      if (error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Make sure Laravel is running on port 8000.');
      } else if (error.message.includes('NetworkError')) {
        toast.error('Network error. Check your connection.');
      } else if (error.message.includes('Invalid credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
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
            <h1>Welcome Back</h1>
            <p>Sign in to continue your travel journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
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

export default Login;