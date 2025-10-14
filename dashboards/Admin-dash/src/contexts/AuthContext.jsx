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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          // Only allow admin users
          if (parsedUser.role?.toLowerCase() === 'admin') {
            setUser(parsedUser);
          } else {
            // Clear invalid user data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    if (userData.role?.toLowerCase() === 'admin') {
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  const isAuthenticated = () => {
    return user !== null && user.role?.toLowerCase() === 'admin';
  };

  const value = {
    user,
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
