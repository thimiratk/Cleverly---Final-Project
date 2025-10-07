// API Configuration
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || 'https://animated-space-umbrella-g4x9q94q5gv53p47-6001.app.github.dev';
const DOMAIN_API_BASE_URL = import.meta.env.VITE_DOMAIN_API_BASE_URL || 'https://animated-space-umbrella-g4x9q94q5gv53p47-6003.app.github.dev';
const REVIEW_API_BASE_URL = import.meta.env.VITE_REVIEW_API_BASE_URL || 'https://animated-space-umbrella-g4x9q94q5gv53p47-6002.app.github.dev';

// Generic API call function (for admin dashboard endpoints)
const apiCall = async (endpoint, options = {}) => {
  const url = `${AUTH_API_BASE_URL}${endpoint}`;
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

  // Handle 204 No Content responses (for delete operations)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Domain API call function  
const domainApiCall = async (endpoint, options = {}) => {
  const url = `${DOMAIN_API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
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
  const url = `${REVIEW_API_BASE_URL}${endpoint}`;
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
  getCategories: () => domainApiCall('/api/categories'),
  getCategoryById: (id) => domainApiCall(`/api/categories/${id}`),
  
  createCategory: (categoryData) =>
    domainApiCall('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  updateCategory: (id, categoryData) =>
    domainApiCall(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: (id) =>
    domainApiCall(`/api/categories/${id}`, {
      method: 'DELETE',
    }),

  // Subcategories
  getSubCategories: () => domainApiCall('/api/subcategories'),
  getSubCategoryById: (id) => domainApiCall(`/api/subcategories/${id}`),

  getSubCategoriesByCategory: (categoryId) =>
    domainApiCall(`/api/categories/${categoryId}/subcategories`),

  createSubCategory: (subCategoryData) =>
    domainApiCall('/api/subcategories', {
      method: 'POST',
      body: JSON.stringify(subCategoryData),
    }),

  updateSubCategory: (id, subCategoryData) =>
    domainApiCall(`/api/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subCategoryData),
    }),

  deleteSubCategory: (id) =>
    domainApiCall(`/api/subcategories/${id}`, {
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
  getExceptional: () => reviewApiCall('/reviews/exceptional'),
  convertExceptional: (reviewId, categoryData) => 
    reviewApiCall(`/reviews/exceptional/${reviewId}/convert`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
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
