import { getReviews } from './api';

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
};

export default reviewService;