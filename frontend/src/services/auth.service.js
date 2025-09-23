// src/services/auth.service.js
import axios from 'axios';

const API_URL = 'animated-space-umbrella-g4x9q94q5gv53p47-6001.app.github.dev'; // adjust if deployed

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Login user
export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Get current logged-in user
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') return JSON.parse(storedUser);
    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
