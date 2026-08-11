import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  // Set token in axios defaults and localStorage
  const saveToken = useCallback((accessToken) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
    }
    setToken(accessToken);
  }, []);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        try {
          const response = await authService.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Token might be expired, try refresh
          try {
            const refreshResponse = await authService.refreshToken();
            saveToken(refreshResponse.data.accessToken);
            const meResponse = await authService.getMe();
            setUser(meResponse.data.user);
          } catch {
            // Refresh also failed — clear everything
            saveToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [saveToken]);

  // Auto-logout after 10 minutes of inactivity
  useEffect(() => {
    if (!token) return;

    let inactivityTimer;
    
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity') || Date.now().toString());
      if (Date.now() - lastActivity > 10 * 60 * 1000) { // 10 minutes
        // Logout user
        saveToken(null);
        setUser(null);
        localStorage.removeItem('lastActivity');
        // You could also redirect to login page here, but updating context will unmount private routes
      }
    };

    // Initialize
    updateActivity();
    inactivityTimer = setInterval(checkInactivity, 60000); // Check every minute

    // Listen to user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));

    return () => {
      clearInterval(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [token, saveToken]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { user: userData, accessToken } = response.data;
    saveToken(accessToken);
    setUser(userData);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { user: newUser, accessToken } = response.data;
    saveToken(accessToken);
    setUser(newUser);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue logout even if API call fails
    }
    saveToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
