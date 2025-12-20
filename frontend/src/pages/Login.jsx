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
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          mot_de_passe: password,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      const user = data.user;
      const token = data.token;

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));

      login(userData, token);

      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');

    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Server error. Check backend connection.");
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
                <Mail size={18} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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
              Don't have an account? <Link to="/signup" className="auth-link">Sign up here</Link>
            </p>
            <Link to="/" className="back-link">← Back to home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
