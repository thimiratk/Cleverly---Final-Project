// src/services/auth.service.js
import axios from 'axios';

const API_URL = 'http://localhost:6001'; // Backend auth service URL

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    // Backend returns: { message: "OTP sent to email for verification" }
    return {
      success: true,
      message: response.data.message,
      requiresOtp: true
    };
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.message
    };
  }
};

// Verify user with OTP
export const verifyUser = async (verificationData) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, verificationData);
    // Backend returns: { success: true, message: "User verified successfully" }
    if (response.data.success) {
      // After successful verification, automatically log in the user
      const loginResponse = await axios.post(`${API_URL}/login`, {
        email: verificationData.email,
        password: verificationData.password
      });

      if (loginResponse.data.user) {
        localStorage.setItem('token', loginResponse.data.token || 'temp_token');
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      }

      return {
        success: true,
        message: response.data.message,
        user: loginResponse.data.user
      };
    }
    return response.data;
  } catch (error) {
    console.error('Verify error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.message
    };
  }
};

// Login user
export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    // Backend returns: { message: "Login successful", user: { id, email, name } }
    if (response.data.user) {
      localStorage.setItem('token', response.data.token || 'temp_token');
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return {
        success: true,
        message: response.data.message,
        user: response.data.user
      };
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.message
    };
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
