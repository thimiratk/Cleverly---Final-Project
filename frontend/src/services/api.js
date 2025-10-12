import axios from "axios";

// Request cache to prevent duplicate requests
const requestCache = new Map();
const REQUEST_CACHE_TTL = 5000; // 5 seconds

// Active requests to prevent duplicates
const activeRequests = new Map();

// Helper function to create cache key
const createCacheKey = (url, params) => {
  return url + '?' + new URLSearchParams(params).toString();
};

// Helper function to retry with exponential backoff
const retryWithBackoff = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Helper function to get cached request or make new one
const getCachedRequest = async (cacheKey, requestFn) => {
  const now = Date.now();
  const cached = requestCache.get(cacheKey);
  
  // Return cached result if still valid
  if (cached && (now - cached.timestamp) < REQUEST_CACHE_TTL) {
    return cached.data;
  }
  
  // Check if request is already in progress
  if (activeRequests.has(cacheKey)) {
    return activeRequests.get(cacheKey);
  }
  
  // Make new request with retry logic
  const requestPromise = retryWithBackoff(requestFn);
  activeRequests.set(cacheKey, requestPromise);
  
  try {
    const result = await requestPromise;
    requestCache.set(cacheKey, {
      data: result,
      timestamp: now
    });
    return result;
  } catch (error) {
    // Remove failed request from cache
    requestCache.delete(cacheKey);
    throw error;
  } finally {
    activeRequests.delete(cacheKey);
  }
};

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Set the base URL for the API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080/api";

// Set the base URL for the API
const API = axios.create({
  baseURL: API_GATEWAY_URL,
  withCredentials: true,
});

let isRefreshing = false;
/** @type {(() => void)[]} */
let refreshSubscribers = [];

// Redirect to login page
const handleLogout = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

/**
 * Subscribe to token refresh
 * @param {() => void} callback
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers that refresh was successful
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Try to get access token from cookies first
    let accessToken = getCookie('accessToken');
    
    // If not in cookies, try localStorage (for cross-origin compatibility)
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(API(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );
        isRefreshing = false;
        onRefreshSuccess();
        return API(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication is handled via cookies, no need for Authorization header
export default API;

// Review API functions (now going through API Gateway)
const reviewApi = axios.create({
  baseURL: API_GATEWAY_URL,
  withCredentials: true,
});

// Domain API functions (for categories and subcategories - now going through API Gateway)
const domainApi = axios.create({
  baseURL: API_GATEWAY_URL,
  withCredentials: true,
});

// User Profile API functions (now going through API Gateway)
const userProfileApi = axios.create({
  baseURL: API_GATEWAY_URL,
  withCredentials: true,
});

// Add the same authentication interceptors to userProfileApi
userProfileApi.interceptors.request.use(
  (config) => {
    // Debug: log all available cookies
    console.log('All cookies:', document.cookie);
    
    // Try to get access token from cookies first
    let accessToken = getCookie('accessToken');
    console.log('Access token from cookie:', accessToken);
    
    // If not in cookies, try localStorage (for cross-origin compatibility)
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
      console.log('Access token from localStorage:', accessToken);
    }
    
    // Also check localStorage for debugging
    const userFromStorage = localStorage.getItem('user');
    console.log('User from localStorage:', userFromStorage);
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Added Authorization header:', config.headers.Authorization);
    } else {
      console.log('No access token found in cookies or localStorage');
      // For now, let's see if the user is logged in
      if (userFromStorage && userFromStorage !== 'undefined') {
        console.log('User is logged in according to localStorage, but no access token available');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

userProfileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(userProfileApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );
        isRefreshing = false;
        onRefreshSuccess();
        return userProfileApi(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const createReview = async (reviewData) => {
  const response = await reviewApi.post('/reviews', reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await reviewApi.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId, userId) => {
  const response = await reviewApi.delete(`/reviews/${reviewId}`, {
    data: { userId },
  });
  return response.data;
};

export const getReviews = async (params = {}) => {
  const cacheKey = createCacheKey('/reviews', params);
  return getCachedRequest(cacheKey, async () => {
    const response = await reviewApi.get('/reviews', { params });
    return response.data;
  });
};

// Category functions - now using domain service
export const getCategories = async () => {
  const response = await domainApi.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await domainApi.post('/categories', categoryData);
  return response.data;
};

export const getSubCategories = async () => {
  const response = await domainApi.get('/subcategories');
  return response.data;
};

export const getSubCategoriesByCategory = async (categoryId) => {
  const response = await domainApi.get(`/categories/${categoryId}/subcategories`);
  return response.data;
};

export const createSubCategory = async (subCategoryData) => {
  const response = await domainApi.post('/subcategories', subCategoryData);
  return response.data;
};

// Voting API functions
export const upvoteReview = async (reviewId, userId) => {
  return retryWithBackoff(async () => {
    const response = await API.post('/interactions/upvote', { reviewId, userId });
    return response.data;
  });
};

export const downvoteReview = async (reviewId, userId) => {
  return retryWithBackoff(async () => {
    const response = await API.post('/interactions/downvote', { reviewId, userId });
    return response.data;
  });
};

export const removeVote = async (reviewId, userId) => {
  return retryWithBackoff(async () => {
    const response = await API.post('/interactions/remove-vote', { reviewId, userId });
    return response.data;
  });
};

export const getUserVoteStatus = async (reviewId, userId) => {
  const cacheKey = createCacheKey(`/interactions/user-vote/${reviewId}/${userId}`, {});
  return getCachedRequest(cacheKey, async () => {
    const response = await API.get(`/interactions/user-vote/${reviewId}/${userId}`);
    return response.data;
  });
};

export const getInteractionStats = async (reviewId) => {
  const cacheKey = createCacheKey(`/interactions/stats/${reviewId}`, {});
  return getCachedRequest(cacheKey, async () => {
    const response = await API.get(`/interactions/stats/${reviewId}`);
    return response.data;
  });
};

// Comment API functions
export const addComment = async (reviewId, userId, content, parentCommentId = null) => {
  return retryWithBackoff(async () => {
    const response = await API.post('/comments/add', { 
      reviewId, 
      userId, 
      content, 
      parentCommentId 
    });
    return response.data;
  });
};

export const getComments = async (reviewId, options = {}) => {
  const { page = 1, limit = 20, sortBy = 'newest', userId } = options;
  const cacheKey = createCacheKey(`/comments/review/${reviewId}`, { page, limit, sortBy, userId: userId || '' });
  return getCachedRequest(cacheKey, async () => {
    const response = await API.get(`/comments/review/${reviewId}`, {
      params: { page, limit, sortBy, userId }
    });
    return response.data;
  });
};

export const updateComment = async (commentId, content, userId) => {
  return retryWithBackoff(async () => {
    const response = await API.put(`/comments/${commentId}`, { content, userId });
    return response.data;
  });
};

export const deleteComment = async (commentId, userId) => {
  return retryWithBackoff(async () => {
    const response = await API.delete(`/comments/${commentId}`, { data: { userId } });
    return response.data;
  });
};

export const likeComment = async (commentId, userId) => {
  return retryWithBackoff(async () => {
    const response = await API.post(`/comments/${commentId}/like`, { userId });
    return response.data;
  });
};

export const unlikeComment = async (commentId, userId) => {
  return retryWithBackoff(async () => {
    // Backend expects POST to /:commentId/unlike with { userId }
    const response = await API.post(`/comments/${commentId}/unlike`, { userId });
    return response.data;
  });
};

// Export userProfileApi for use in userProfile service
export { userProfileApi };
