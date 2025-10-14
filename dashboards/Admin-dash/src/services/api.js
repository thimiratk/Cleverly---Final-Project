// API Configuration
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api';

// Helper function to get authentication token
const getAuthToken = () => {
  // Try to get token from localStorage first
  const token = localStorage.getItem('accessToken');
  if (token) return token;
  
  // Fallback to cookies if available
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  
  return null;
};

// Generic API call function (for admin dashboard endpoints)
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_GATEWAY_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  // Handle 204 No Content responses (for delete operations)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Domain API call function  
const domainApiCall = async (endpoint, options = {}) => {
  const url = `${API_GATEWAY_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`Domain API call failed: ${response.statusText}`);
  }

  // Handle 204 No Content responses (for delete operations)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Review API call function
const reviewApiCall = async (endpoint, options = {}) => {
  const url = `${API_GATEWAY_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`Review API call failed: ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Domain Management API calls
export const domainAPI = {
  // Categories
  getCategories: () => domainApiCall('/categories'),
  getCategoryById: (id) => domainApiCall(`/categories/${id}`),
  
  createCategory: (categoryData) =>
    domainApiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  updateCategory: (id, categoryData) =>
    domainApiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: (id) =>
    domainApiCall(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Subcategories
  getSubCategories: () => domainApiCall('/subcategories'),
  getSubCategoryById: (id) => domainApiCall(`/subcategories/${id}`),

  getSubCategoriesByCategory: (categoryId) =>
    domainApiCall(`/categories/${categoryId}/subcategories`),

  createSubCategory: (subCategoryData) =>
    domainApiCall('/subcategories', {
      method: 'POST',
      body: JSON.stringify(subCategoryData),
    }),

  updateSubCategory: (id, subCategoryData) =>
    domainApiCall(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subCategoryData),
    }),

  deleteSubCategory: (id) =>
    domainApiCall(`/subcategories/${id}`, {
      method: 'DELETE',
    }),
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
  getAll: () => reviewApiCall('/reviews'),
  create: (reviewData) => 
    reviewApiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  like: (reviewId) => 
    reviewApiCall(`/reviews/${reviewId}/like`, {
      method: 'POST',
    }),
  comment: (reviewId, content) => 
    reviewApiCall(`/reviews/${reviewId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  update: (reviewId, reviewData) => 
    reviewApiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  delete: (reviewId) => 
    reviewApiCall(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
  // New exceptional reviews endpoints
  getExceptionalReviews: () => reviewApiCall('/reviews/exceptional'),
  getExceptional: () => reviewApiCall('/reviews/exceptional'),
  getAdminStats: () => reviewApiCall('/reviews/admin/stats'),
  convertExceptional: (reviewId, categoryData) => 
    reviewApiCall(`/reviews/exceptional/${reviewId}/convert`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),
  createCategoryFromExceptional: (reviewId, categoryName) =>
    reviewApiCall(`/reviews/exceptional/${reviewId}/create-category`, {
      method: 'POST',
      body: JSON.stringify({ categoryName }),
    }),
  createSubCategoryFromExceptional: (reviewId, subcategoryName, categoryId) =>
    reviewApiCall(`/reviews/exceptional/${reviewId}/create-subcategory`, {
      method: 'POST',
      body: JSON.stringify({ subcategoryName, categoryId }),
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

// Analytics API calls
export const analyticsAPI = {
  getStats: () => apiCall('/analytics'),
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

// Moderator API calls
export const moderatorAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall('/moderators' + (queryString ? `?${queryString}` : ''));
  },
  getById: (id) => apiCall(`/moderators/${id}`),
  create: (moderatorData) => 
    apiCall('/moderators', {
      method: 'POST',
      body: JSON.stringify(moderatorData),
    }),
  update: (id, moderatorData) => 
    apiCall(`/moderators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moderatorData),
    }),
  delete: (id) => 
    apiCall(`/moderators/${id}`, {
      method: 'DELETE',
    }),
  getStats: () => apiCall('/moderators/stats'),
  login: (credentials) =>
    apiCall('/moderators/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};
