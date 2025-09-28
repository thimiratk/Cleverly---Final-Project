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
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    const result = await AuthService.loginUser({ email, password });
    if (result.success) {
      setUser(result.user);
      navigate('/reviews'); // redirect after login
    }
    return result;
  };

  // Register function
  const register = async (userData) => {
    const result = await AuthService.registerUser(userData);
    if (result.success) {
      setUser(result.user);
      navigate('/reviews'); // redirect after registration
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
