const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api';

const discoverService = {
  // Get top reviewers
  getTopReviewers: async (limit = 10) => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/profile/top-reviewers?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top reviewers');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching top reviewers:', error);
      throw error;
    }
  },

  // Get categories with review counts
  getCategories: async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/domain/categories/discover`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

export default discoverService;
