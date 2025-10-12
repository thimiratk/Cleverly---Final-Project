// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On app startup, check if user is already logged in
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getCurrentUser();
        if (storedUser && isMounted) {
          setUser(storedUser);
        }

        const { user: fetchedUser, status } = await AuthService.fetchCurrentUser();
        if (fetchedUser && isMounted) {
          setUser(fetchedUser);
        } else if (!fetchedUser && storedUser && status === 401 && isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth context:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    const result = await AuthService.loginUser({ email, password });
    if (result.success && result.user) {
      setUser(result.user);
      navigate('/'); // redirect after login
    }
    return result;
  };

  // Register function
  const register = async (userData) => {
    const result = await AuthService.registerUser(userData);
    if (result.success && result.user) {
      setUser(result.user);
      navigate('/'); // redirect after registration
    }
    return result;
  };

  // Logout function
  const logout = async () => {
    await AuthService.logoutUser();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
