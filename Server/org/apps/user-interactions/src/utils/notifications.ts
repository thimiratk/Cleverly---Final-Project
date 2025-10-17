import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export interface NotificationData {
  userId: string;
  type: 'FOLLOW' | 'REVIEW_VOTE' | 'COMMENT' | 'COMMENT_LIKE' | 'REVIEW_STATUS';
  title: string;
  message: string;
  data?: any;
  relatedUserId?: string;
}

export const createNotification = async (notificationData: NotificationData) => {
  try {
    const notification = await prisma.notifications.create({
      data: {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        relatedUserId: notificationData.relatedUserId,
        isRead: false
      }
    });

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

export const broadcastNotification = (io: any, userId: string, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};
