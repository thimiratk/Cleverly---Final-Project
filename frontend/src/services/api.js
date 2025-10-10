import axios from 'axios';

// Backend API URL - Update this when your backend developer provides the actual URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with common config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens (when implemented)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// ADMIN DASHBOARD API ENDPOINTS
// These endpoints will be implemented by your backend developer
// ==========================================

// Dashboard Statistics
export const dashboardAPI = {
  // Get overview statistics
  getStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },

  // Get activity timeline
  getRecentActivity: async (limit = 20) => {
    const response = await api.get(`/api/admin/dashboard/activity?limit=${limit}`);
    return response.data;
  },

  // Get trends data for charts
  getTrends: async (period = '7d') => {
    const response = await api.get(`/api/admin/dashboard/trends?period=${period}`);
    return response.data;
  },
};

// Posts/Reviews Management
export const postsAPI = {
  // Get all posts with filters and pagination
  getAll: async (params = {}) => {
    const { page = 1, limit = 20, status, fraudStatus, sortBy = 'createdAt', order = 'desc' } = params;
    const response = await api.get('/api/admin/posts', {
      params: { page, limit, status, fraudStatus, sortBy, order },
    });
    return response.data;
  },

  // Get single post details with full analysis
  getById: async (postId) => {
    const response = await api.get(`/api/admin/posts/${postId}`);
    return response.data;
  },

  // Get post with comments and sentiment
  getWithComments: async (postId) => {
    const response = await api.get(`/api/admin/posts/${postId}/comments`);
    return response.data;
  },

  // Update post status (approve, reject, flag, pending)
  updateStatus: async (postId, status, reason = '') => {
    const response = await api.patch(`/api/admin/posts/${postId}/status`, {
      status,
      reason,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  // Delete post
  delete: async (postId, reason) => {
    const response = await api.delete(`/api/admin/posts/${postId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Get fraud analysis details
  getFraudAnalysis: async (postId) => {
    const response = await api.get(`/api/admin/posts/${postId}/fraud-analysis`);
    return response.data;
  },

  // Trigger manual re-analysis
  reAnalyze: async (postId) => {
    const response = await api.post(`/api/admin/posts/${postId}/re-analyze`);
    return response.data;
  },
};

// Comments Management
export const commentsAPI = {
  // Get all comments with filters
  getAll: async (params = {}) => {
    const { page = 1, limit = 20, sentiment, postId, sortBy = 'createdAt', order = 'desc' } = params;
    const response = await api.get('/api/admin/comments', {
      params: { page, limit, sentiment, postId, sortBy, order },
    });
    return response.data;
  },

  // Get comment details
  getById: async (commentId) => {
    const response = await api.get(`/api/admin/comments/${commentId}`);
    return response.data;
  },

  // Update comment status
  updateStatus: async (commentId, status, reason = '') => {
    const response = await api.patch(`/api/admin/comments/${commentId}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  // Delete comment
  delete: async (commentId, reason) => {
    const response = await api.delete(`/api/admin/comments/${commentId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Re-analyze sentiment
  reAnalyzeSentiment: async (commentId) => {
    const response = await api.post(`/api/admin/comments/${commentId}/re-analyze`);
    return response.data;
  },
};

// Users Management
export const usersAPI = {
  // Get all users with filters
  getAll: async (params = {}) => {
    const { page = 1, limit = 20, status, riskLevel, sortBy = 'createdAt', order = 'desc', search = '' } = params;
    const response = await api.get('/api/admin/users', {
      params: { page, limit, status, riskLevel, sortBy, order, search },
    });
    return response.data;
  },

  // Get user details with activity summary
  getById: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Get user's posts
  getUserPosts: async (userId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/api/admin/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's comments
  getUserComments: async (userId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/api/admin/users/${userId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Update user status
  updateStatus: async (userId, status, reason = '') => {
    const response = await api.patch(`/api/admin/users/${userId}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  // Suspend user
  suspend: async (userId, duration, reason) => {
    const response = await api.post(`/api/admin/users/${userId}/suspend`, {
      duration,
      reason,
    });
    return response.data;
  },

  // Ban user permanently
  ban: async (userId, reason) => {
    const response = await api.post(`/api/admin/users/${userId}/ban`, {
      reason,
    });
    return response.data;
  },

  // Unsuspend/unban user
  reactivate: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/reactivate`);
    return response.data;
  },

  // Get user activity history
  getActivityHistory: async (userId, params = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/api/admin/users/${userId}/activity`, {
      params: { page, limit },
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  // Get fraud detection analytics
  getFraudAnalytics: async (period = '30d') => {
    const response = await api.get(`/api/admin/analytics/fraud?period=${period}`);
    return response.data;
  },

  // Get sentiment analytics
  getSentimentAnalytics: async (period = '30d') => {
    const response = await api.get(`/api/admin/analytics/sentiment?period=${period}`);
    return response.data;
  },

  // Get user behavior analytics
  getUserAnalytics: async (period = '30d') => {
    const response = await api.get(`/api/admin/analytics/users?period=${period}`);
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  // Get all settings
  getAll: async () => {
    const response = await api.get('/api/admin/settings');
    return response.data;
  },

  // Update settings
  update: async (settings) => {
    const response = await api.patch('/api/admin/settings', settings);
    return response.data;
  },

  // Get fraud detection thresholds
  getFraudThresholds: async () => {
    const response = await api.get('/api/admin/settings/fraud-thresholds');
    return response.data;
  },

  // Update fraud detection thresholds
  updateFraudThresholds: async (thresholds) => {
    const response = await api.patch('/api/admin/settings/fraud-thresholds', thresholds);
    return response.data;
  },
};

export default api;
