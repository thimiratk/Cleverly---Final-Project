/**
 * Badge Management API Service
 * Handles all badge-related API calls
 */

import axios from 'axios';

const API_URL = 'http://localhost:6004/admin';

// Badge CRUD
export const getAllBadges = async () => {
  const response = await axios.get(`${API_URL}/badges`);
  return response.data;
};

export const getBadgeById = async (badgeId) => {
  const response = await axios.get(`${API_URL}/badges/${badgeId}`);
  return response.data;
};

export const createBadge = async (badgeData) => {
  const response = await axios.post(`${API_URL}/badges`, badgeData);
  return response.data;
};

export const updateBadge = async (badgeId, badgeData) => {
  const response = await axios.put(`${API_URL}/badges/${badgeId}`, badgeData);
  return response.data;
};

export const deleteBadge = async (badgeId) => {
  const response = await axios.delete(`${API_URL}/badges/${badgeId}`);
  return response.data;
};

// Badge statistics
export const getBadgeStatistics = async () => {
  const response = await axios.get(`${API_URL}/badges/statistics/overview`);
  return response.data;
};

// Eligibility and assignment
export const getEligibleUsers = async (badgeId) => {
  const response = await axios.get(`${API_URL}/badges/${badgeId}/eligible-users`);
  return response.data;
};

export const assignBadge = async (badgeId, userId, assignedBy) => {
  const response = await axios.post(`${API_URL}/badges/${badgeId}/assign`, {
    userId,
    assignedBy
  });
  return response.data;
};

export const bulkAssignBadges = async (badgeId, userIds, assignedBy) => {
  const response = await axios.post(`${API_URL}/badges/assign/bulk`, {
    badgeId,
    userIds,
    assignedBy
  });
  return response.data;
};

// User badges
export const getUserBadges = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}/badges`);
  return response.data;
};

export const removeBadgeFromUser = async (userId, badgeId) => {
  const response = await axios.delete(`${API_URL}/users/${userId}/badges/${badgeId}`);
  return response.data;
};

// Cloudinary upload helper
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Use existing 'images' preset from Cloudinary
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'images';
  formData.append('upload_preset', uploadPreset);
  
  // Add transformation for badge images (200x200, auto-compress)
  formData.append('folder', 'badges'); // Optional: organize in folder
  
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drltde5us';
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  try {
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    // Return transformed URL with resize
    const publicId = response.data.public_id;
    const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_200,h_200,q_auto:low/${publicId}`;
    
    return transformedUrl;
  } catch (error) {
    console.error('Cloudinary upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export default {
  getAllBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  getBadgeStatistics,
  getEligibleUsers,
  assignBadge,
  bulkAssignBadges,
  getUserBadges,
  removeBadgeFromUser,
  uploadImageToCloudinary
};
