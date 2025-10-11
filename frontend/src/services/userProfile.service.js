import { userProfileApi } from './api';

const USER_PROFILE_BASE_URL = '/profile';

export const userProfileService = {
  // Get current user's profile
  getCurrentUserProfile: async () => {
    try {
      console.log('Attempting to get current user profile...');
      const response = await userProfileApi.get(`${USER_PROFILE_BASE_URL}/me`);
      console.log('Profile data retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error.response?.data || error.message;
    }
  },

  // Get any user's profile by ID
  getUserProfile: async (userId) => {
    try {
      console.log('UserProfileService: Fetching profile for userId:', userId);
      const response = await userProfileApi.get(`${USER_PROFILE_BASE_URL}/${userId}`);
      console.log('UserProfileService: Profile data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserProfileService: Error fetching user profile:', error);
      console.error('UserProfileService: Error response:', error.response?.data);
      console.error('UserProfileService: Error status:', error.response?.status);
      throw error.response?.data || error.message;
    }
  },

  // Update current user's profile
  updateProfile: async (profileData) => {
    try {
      console.log('Service - Sending profile data:', profileData);
      const response = await userProfileApi.put(`${USER_PROFILE_BASE_URL}/me`, profileData);
      console.log('Service - Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Service - Profile update error:', error);
      console.error('Service - Error response:', error.response?.data);
      
      // Throw the actual error response for better error handling
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { error: error.message || 'Network error occurred' };
      }
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await userProfileApi.post(`${USER_PROFILE_BASE_URL}/me/profile-picture`, formData);
      console.log('Service - Profile picture upload success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Service - Profile picture upload error:', error);
      console.error('Service - Error response:', error.response?.data);
      
      // Throw the actual error response for better error handling
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { error: error.message || 'Network error occurred' };
      }
    }
  },

  // Upload cover picture
  uploadCoverPicture: async (file) => {
    try {
      console.log('Service - Uploading cover picture:', file);
      const formData = new FormData();
      formData.append('coverPicture', file);
      
      const response = await userProfileApi.post(`${USER_PROFILE_BASE_URL}/me/cover-picture`, formData);
      console.log('Service - Cover picture upload success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Service - Cover picture upload error:', error);
      console.error('Service - Error response:', error.response?.data);
      
      // Throw the actual error response for better error handling
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { error: error.message || 'Network error occurred' };
      }
    }
  },

  // Get follow statistics
  getFollowStats: async (userId) => {
    try {
      const response = await userProfileApi.get(`${USER_PROFILE_BASE_URL}/${userId}/follow-stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Follow a user
  followUser: async (userId) => {
    try {
      const response = await userProfileApi.post(`${USER_PROFILE_BASE_URL}/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    try {
      const response = await userProfileApi.delete(`${USER_PROFILE_BASE_URL}/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user badges and trust score
  getUserBadges: async (userId) => {
    try {
      const response = await userProfileApi.get(`${USER_PROFILE_BASE_URL}/${userId}/badges`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userProfileService;