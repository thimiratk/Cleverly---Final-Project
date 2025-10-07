import axios from "axios";

// Set the base URL for the API
const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:6001",
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
  (config) => config,
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

// Review API functions
const reviewApi = axios.create({
  baseURL: import.meta.env.VITE_REVIEW_SERVER_URL || "https://animated-space-umbrella-g4x9q94q5gv53p47-6002.app.github.dev",
  withCredentials: true,
});

// Domain API functions (for categories and subcategories)
const domainApi = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN_SERVER_URL || "https://animated-space-umbrella-g4x9q94q5gv53p47-6003.app.github.dev",
  withCredentials: true,
});

export const createReview = async (reviewData) => {
  const response = await reviewApi.post('/reviews', reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await reviewApi.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const getReviews = async (params = {}) => {
  const response = await reviewApi.get('/reviews', { params });
  return response.data;
};

// Category functions - now using domain service
export const getCategories = async () => {
  const response = await domainApi.get('/api/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await domainApi.post('/api/categories', categoryData);
  return response.data;
};

export const getSubCategories = async () => {
  const response = await domainApi.get('/api/subcategories');
  return response.data;
};

export const getSubCategoriesByCategory = async (categoryId) => {
  const response = await domainApi.get(`/api/categories/${categoryId}/subcategories`);
  return response.data;
};

export const createSubCategory = async (subCategoryData) => {
  const response = await domainApi.post('/api/subcategories', subCategoryData);
  return response.data;
};
