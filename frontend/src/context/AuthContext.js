// In context/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check localStorage for existing auth data (for page refresh)
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    
    // Store in localStorage for persistence
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('token', authToken); // For backward compatibility
    }
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    // Call Laravel logout endpoint if needed
    if (token) {
      fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).catch(console.error);
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
  };

  // For making authenticated requests to Laravel
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  const value = {
    user,
    currentUser: user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    authFetch, // Helper for authenticated requests
    authHeader: () => token ? { 'Authorization': `Bearer ${token}` } : {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};