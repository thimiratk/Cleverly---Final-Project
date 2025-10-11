import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Store io instance (will be set by main.ts)
let ioInstance: any = null;

export const setSocketIO = (io: any) => {
  ioInstance = io;
};

// Follow a user
router.post('/follow', async (req, res): Promise<void> => {
  try {
    const { followerId, followingId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (followerId === followingId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    // Check if already following
    const existingFollow = await prisma.userFollows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      res.status(400).json({ error: 'Already following this user' });
      return;
    }

    // Create follow relationship
    await prisma.userFollows.create({
      data: {
        followerId,
        followingId
      }
    });

    // Get follower info for notification
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true, profilePicture: true }
    });

    // Create notification
    await prisma.notifications.create({
      data: {
        userId: followingId,
        type: 'FOLLOW',
        title: 'New Follower',
        message: `${follower?.name || 'Someone'} started following you`,
        relatedUserId: followerId
      }
    });

    // Get updated follower count
    const followerCount = await prisma.userFollows.count({
      where: { followingId }
    });

    // Emit real-time notification
    if (ioInstance) {
      ioInstance.to(`user:${followingId}`).emit('user:new-follower', {
        followerId,
        followerName: follower?.name,
        followerPicture: follower?.profilePicture,
        followerCount,
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true, 
      message: 'Successfully followed user',
      followerId,
      followingId,
      followerCount
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.post('/unfollow', async (req, res): Promise<void> => {
  try {
    const { followerId, followingId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Remove follow relationship
    await prisma.userFollows.deleteMany({
      where: {
        followerId,
        followingId
      }
    });

    // Get updated follower count
    const followerCount = await prisma.userFollows.count({
      where: { followingId }
    });

    // Emit real-time notification
    if (ioInstance) {
      ioInstance.to(`user:${followingId}`).emit('user:lost-follower', {
        followerId,
        followerCount,
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true, 
      message: 'Successfully unfollowed user',
      followerId,
      followingId,
      followerCount
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers list
router.get('/followers/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const prisma: PrismaClient = req.app.locals.prisma;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get followers with user info
    const followers = await prisma.userFollows.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    });

    // Get total count
    const totalCount = await prisma.userFollows.count({
      where: { followingId: userId }
    });

    res.json({
      userId,
      followers: followers.map((f: any) => f.follower),
      totalCount,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get following list
router.get('/following/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const prisma: PrismaClient = req.app.locals.prisma;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get following with user info
    const following = await prisma.userFollows.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    });

    // Get total count
    const totalCount = await prisma.userFollows.count({
      where: { followerId: userId }
    });

    res.json({
      userId,
      following: following.map((f: any) => f.following),
      totalCount,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// Check if user A follows user B
router.get('/check/:followerId/:followingId', async (req, res): Promise<void> => {
  try {
    const { followerId, followingId } = req.params;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Check follow relationship
    const followRelationship = await prisma.userFollows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    const isFollowing = !!followRelationship;

    res.json({ 
      isFollowing,
      followerId,
      followingId,
      followedAt: followRelationship?.createdAt || null
    });
  } catch (error) {
    console.error('Check follow error:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

export default router;