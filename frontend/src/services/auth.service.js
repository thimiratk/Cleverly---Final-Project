// src/services/auth.service.js
import API from './api';

const STORAGE_KEY = 'user';

const normalizeUser = (rawUser = {}) => {
  if (!rawUser) {
    return null;
  }

  const id = rawUser.id || rawUser._id || rawUser.userId || rawUser.uid || null;

  return {
    ...rawUser,
    ...(id ? { id } : {}),
  };
};

const storeUser = (user) => {
  const normalized = normalizeUser(user);
  if (normalized) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
};

const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await API.post('/register', userData);
    // Backend returns: { message: "OTP sent to email for verification" }
    return {
      success: true,
      message: response.data.message,
      requiresOtp: true
    };
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    
    // Extract error message as a string
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (typeof errorData === 'object') {
        // Check for nested error object: {error: {message: "...", status: 400}}
        if (errorData.error && typeof errorData.error === 'object' && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
        // Check for direct error string: {error: "Invalid password"}
        else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
        // Check for direct message: {message: "Invalid password"}
        else if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      }
    } else if (error.message && typeof error.message === 'string') {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Verify user with OTP
export const verifyUser = async (verificationData) => {
  try {
    const response = await API.post('/verify', verificationData);
    // Backend returns: { success: true, message: "User verified successfully" }
    if (response.data.success) {
      // After successful verification, automatically log in the user
      const loginResponse = await API.post('/login', {
        email: verificationData.email,
        password: verificationData.password
      });

      if (loginResponse.data.user) {
        storeUser(loginResponse.data.user);

        // Store access token if provided (for cross-origin services)
        if (loginResponse.data.accessToken) {
          localStorage.setItem('accessToken', loginResponse.data.accessToken);
        }
      }

      const normalizedUser = normalizeUser(loginResponse.data.user);

      return {
        success: true,
        message: response.data.message,
        user: normalizedUser
      };
    }
    return response.data;
  } catch (error) {
    console.error('Verify error:', error.response?.data || error.message);
    
    // Extract error message as a string
    let errorMessage = 'Verification failed. Please try again.';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (typeof errorData === 'object') {
        // Check for nested error object: {error: {message: "...", status: 400}}
        if (errorData.error && typeof errorData.error === 'object' && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
        // Check for direct error string: {error: "Invalid password"}
        else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
        // Check for direct message: {message: "Invalid password"}
        else if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      }
    } else if (error.message && typeof error.message === 'string') {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Login user
export const loginUser = async ({ email, password }) => {
  try {
    const response = await API.post('/login', { email, password });
    // Backend returns: { message: "Login successful", user: { id, email, name } }
    if (response.data.user) {
      const normalizedUser = storeUser(response.data.user);

      // Store access token if provided (for cross-origin services)
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      return {
        success: true,
        message: response.data.message,
        user: normalizedUser
      };
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    
    // Extract error message as a string
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (typeof errorData === 'object') {
        // Check for nested error object: {error: {message: "...", status: 400}}
        if (errorData.error && typeof errorData.error === 'object' && errorData.error.message) {
          errorMessage = errorData.error.message;
        } 
        // Check for direct error string: {error: "Invalid password"}
        else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
        // Check for direct message: {message: "Invalid password"}
        else if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      }
    } else if (error.message && typeof error.message === 'string') {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Get current logged-in user from storage
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser && storedUser !== 'undefined') {
      return normalizeUser(JSON.parse(storedUser));
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Fetch the current user from the API (useful after OAuth flows)
export const fetchCurrentUser = async () => {
  try {
    const response = await API.get('/auth/me');
    const apiUser = response.data?.user;
    if (!apiUser) {
      return { user: null, status: response.status };
    }

    const normalizedUser = storeUser(apiUser);
    return { user: normalizedUser, status: response.status };
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      clearStoredUser();
    }
    console.error('Failed to fetch current user from API:', error.response?.data || error.message);
    return { user: null, status, error };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await API.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
  // Clear user data from localStorage
  clearStoredUser();
  localStorage.removeItem('accessToken');
};

export { storeUser, normalizeUser, clearStoredUser };
