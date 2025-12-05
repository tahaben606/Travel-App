import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check for default demo account
    if (loginEmail === 'demo@travel.com' && loginPassword === 'demo123') {
      const userData = {
        id: 'demo-1',
        name: 'Demo Traveler',
        email: 'demo@travel.com',
      };
      login(userData);
      toast.success('Welcome back, Demo Traveler!');
      navigate('/dashboard');
      return;
    }

    // Simulate login (in real app, this would be an API call)
    const userData = {
      id: Date.now().toString(),
      name: loginEmail.split('@')[0],
      email: loginEmail,
    };

    login(userData);
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Simulate signup (in real app, this would be an API call)
    const userData = {
      id: Date.now().toString(),
      name: signupName,
      email: signupEmail,
    };

    login(userData);
    toast.success('Account created! Welcome!');
    navigate('/dashboard');
  };

  return (
    <div className="auth-combined-page">
      <div className="auth-combined-container">
        <motion.div
          className="auth-combined-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <MapPin size={40} />
            <h1>Travel Story Journal</h1>
            <p>Document your adventures and relive every moment</p>
          </div>

          {/* Tabs removed per request: no visible Sign In / Sign Up buttons */}
          <div className="auth-mode-heading">
            <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          </div>

          <div className="auth-forms-container">
            {/* Login Form */}
            <motion.div
              className={`auth-form-section ${isLogin ? 'active' : ''}`}
              initial={false}
              animate={{ 
                opacity: isLogin ? 1 : 0,
                display: isLogin ? 'block' : 'none'
              }}
            >
              <div className="default-account-hint">
                <p>💡 <strong>Quick Login:</strong> demo@travel.com / demo123</p>
              </div>
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={18} />
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary btn-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => {
                    setLoginEmail('demo@travel.com');
                    setLoginPassword('demo123');
                  }}
                  className="btn btn-outline btn-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Use Demo Account
                </motion.button>
              </form>
            </motion.div>

            {/* Signup Form */}
            <motion.div
              className={`auth-form-section ${!isLogin ? 'active' : ''}`}
              initial={false}
              animate={{ 
                opacity: !isLogin ? 1 : 0,
                display: !isLogin ? 'block' : 'none'
              }}
            >
              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-group">
                  <label>
                    <User size={18} />
                    Name
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={18} />
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary btn-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Account
                </motion.button>
              </form>
            </motion.div>
          </div>

          <div className="auth-footer">
            <Link to="/" className="back-link">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

