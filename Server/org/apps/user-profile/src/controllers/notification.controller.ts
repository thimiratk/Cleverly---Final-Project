import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// Get all notifications for the current user
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { limit = 20, skip = 0 } = req.query;

    const notifications = await prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(skip),
    });

    const unreadCount = await prisma.notifications.count({
      where: { 
        userId,
        isRead: false 
      }
    });

    return res.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const unreadCount = await prisma.notifications.count({
      where: { 
        userId,
        isRead: false 
      }
    });

    return res.json({ unreadCount });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark a notification as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notifications.findFirst({
      where: { 
        id: notificationId,
        userId 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return res.json(updatedNotification);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await prisma.notifications.updateMany({
      where: { 
        userId,
        isRead: false 
      },
      data: { isRead: true }
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notifications.findFirst({
      where: { 
        id: notificationId,
        userId 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notifications.delete({
      where: { id: notificationId }
    });

    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await prisma.notifications.deleteMany({
      where: { userId }
    });

    return res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting all notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a notification (utility function for internal use)
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any,
  relatedUserId?: string
) => {
  try {
    const notification = await prisma.notifications.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        data: data || {},
        relatedUserId,
        isRead: false
      }
    });

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};
