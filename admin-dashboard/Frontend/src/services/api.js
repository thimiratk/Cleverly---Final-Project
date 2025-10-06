// API base configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Admin API calls
export const adminAPI = {
  getProfile: () => apiCall('/admin/profile'),
  updateProfile: (profileData) => 
    apiCall('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  getStats: () => apiCall('/admin/stats'),
  getActivities: () => apiCall('/admin/activities'),
  getQuickActions: () => apiCall('/admin/quick-actions'),
};

// Reviews API calls
export const reviewsAPI = {
  getAll: () => apiCall('/reviews'),
  create: (reviewData) => 
    apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  like: (reviewId) => 
    apiCall(`/reviews/${reviewId}/like`, {
      method: 'POST',
    }),
  comment: (reviewId, content) => 
    apiCall(`/reviews/${reviewId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  update: (reviewId, reviewData) => 
    apiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  delete: (reviewId) => 
    apiCall(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Badges API calls
export const badgesAPI = {
  getAll: () => apiCall('/badges'),
  create: (badgeData) => 
    apiCall('/badges', {
      method: 'POST',
      body: JSON.stringify(badgeData),
    }),
  assign: (userId, badgeId) => 
    apiCall('/badges/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, badgeId }),
    }),
};

// Users API calls
export const usersAPI = {
  getAll: () => apiCall('/users'),
  getById: (userId) => apiCall(`/users/${userId}`),
  update: (userId, userData) => 
    apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  delete: (userId) => 
    apiCall(`/users/${userId}`, {
      method: 'DELETE',
    }),
};

// Fraud API calls
export const fraudAPI = {
  getAll: () => apiCall('/fraud'),
  create: (fraudData) => 
    apiCall('/fraud', {
      method: 'POST',
      body: JSON.stringify(fraudData),
    }),
  update: (fraudId, fraudData) => 
    apiCall(`/fraud/${fraudId}`, {
      method: 'PUT',
      body: JSON.stringify(fraudData),
    }),
  delete: (fraudId) => 
    apiCall(`/fraud/${fraudId}`, {
      method: 'DELETE',
    }),
};

// Settings API calls
export const settingsAPI = {
  getAll: () => apiCall('/settings'),
  update: (key, value) => 
    apiCall(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
};

// Analytics API calls
export const analyticsAPI = {
  getStats: () => apiCall('/analytics'),
};
