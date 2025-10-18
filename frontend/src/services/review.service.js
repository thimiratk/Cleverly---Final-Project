import { getReviews, deleteReview as deleteReviewApi } from './api';

export const reviewService = {
  // Get reviews by user ID
  getUserReviews: async (userId, params = {}) => {
    try {
      console.log('ReviewService: Getting reviews for userId:', userId);
      
      const response = await getReviews({
        userId: userId, // This will filter reviews for specific user
        sortBy: 'createdAt',
        sortOrder: 'desc', // Latest first
        ...params
      });
      
      console.log('ReviewService: API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  // Get all reviews (for home page)
  getAllReviews: async (params = {}) => {
    try {
      const response = await getReviews({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...params
      });
      return response;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  deleteReview: async (reviewId, userId) => {
    try {
      const response = await deleteReviewApi(reviewId, userId);
      return response;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get community stats
  getCommunityStats: async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/reviews/community/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch community stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching community stats:', error);
      throw error;
    }
  },
};

export default reviewService;