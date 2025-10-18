import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [moderator, setModerator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const moderatorData = localStorage.getItem('moderator');
        
        if (token && moderatorData) {
          const parsedModerator = JSON.parse(moderatorData);
          setModerator(parsedModerator);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('moderator');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (moderatorData) => {
    setModerator(moderatorData);
    return true;
  };

  const logout = () => {
    setModerator(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('moderator');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  const isAuthenticated = () => {
    return moderator !== null;
  };

  const value = {
    moderator,
    user: moderator, // Alias for compatibility
    login,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
