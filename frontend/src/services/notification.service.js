import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/profile';

// Get all notifications for current user
export const getNotifications = async (limit = 20, skip = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      params: { limit, skip },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/read-all`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/${notificationId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/delete-all`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};
