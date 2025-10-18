import express from 'express';
import { PrismaClient } from '../../../../generated/prisma';
import { createNotification, broadcastNotification } from '../utils/notifications';

const router = express.Router();

// Store io instance (will be set by main.ts)
let ioInstance: any = null;

export const setSocketIO = (io: any) => {
  ioInstance = io;
};

// Upvote a review
router.post('/upvote', async (req, res) => {
  try {
    const { reviewId, userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Check if user already voted
    const existingVote = await prisma.reviewVotes.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    if (existingVote) {
      // Update existing vote to upvote
      await prisma.reviewVotes.update({
        where: { id: existingVote.id },
        data: { voteType: 'UPVOTE' }
      });
    } else {
      // Create new upvote
      await prisma.reviewVotes.create({
        data: {
          userId,
          reviewId,
          voteType: 'UPVOTE'
        }
      });
    }

    // Get updated vote counts
    const upvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'UPVOTE' }
    });
    const downvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'DOWNVOTE' }
    });

    // Create notification for review author
    try {
      const review = await prisma.reviews.findUnique({
        where: { id: reviewId },
        include: { 
          user: { select: { id: true, name: true, username: true } }
        }
      });

      if (review && review.userId !== userId) {
        const voter = await prisma.users.findUnique({
          where: { id: userId },
          select: { name: true, username: true }
        });

        const notification = await createNotification({
          userId: review.userId,
          type: 'REVIEW_VOTE',
          title: 'New Upvote',
          message: `${voter?.username || voter?.name} upvoted your review`,
          data: { reviewId, voteType: 'UPVOTE' },
          relatedUserId: userId
        });

        if (notification) {
          broadcastNotification(ioInstance, review.userId, notification);
        }
      }
    } catch (notifError) {
      console.error('Error creating upvote notification:', notifError);
    }

    // Emit to all connected clients
    if (ioInstance) {
      ioInstance.emit('review:upvote', {
        reviewId,
        userId,
        upvotes,
        downvotes,
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true, 
      message: 'Upvote registered',
      reviewId,
      userId,
      upvotes,
      downvotes
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Failed to process upvote' });
  }
});

// Downvote a review
router.post('/downvote', async (req, res) => {
  try {
    const { reviewId, userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Check if user already voted
    const existingVote = await prisma.reviewVotes.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    if (existingVote) {
      // Update existing vote to downvote
      await prisma.reviewVotes.update({
        where: { id: existingVote.id },
        data: { voteType: 'DOWNVOTE' }
      });
    } else {
      // Create new downvote
      await prisma.reviewVotes.create({
        data: {
          userId,
          reviewId,
          voteType: 'DOWNVOTE'
        }
      });
    }

    // Get updated vote counts
    const upvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'UPVOTE' }
    });
    const downvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'DOWNVOTE' }
    });

    // Create notification for review author
    try {
      const review = await prisma.reviews.findUnique({
        where: { id: reviewId },
        include: { 
          user: { select: { id: true, name: true, username: true } }
        }
      });

      if (review && review.userId !== userId) {
        const voter = await prisma.users.findUnique({
          where: { id: userId },
          select: { name: true, username: true }
        });

        const notification = await createNotification({
          userId: review.userId,
          type: 'REVIEW_VOTE',
          title: 'New Downvote',
          message: `${voter?.username || voter?.name} downvoted your review`,
          data: { reviewId, voteType: 'DOWNVOTE' },
          relatedUserId: userId
        });

        if (notification) {
          broadcastNotification(ioInstance, review.userId, notification);
        }
      }
    } catch (notifError) {
      console.error('Error creating downvote notification:', notifError);
    }

    // Emit to all connected clients
    if (ioInstance) {
      ioInstance.emit('review:downvote', {
        reviewId,
        userId,
        upvotes,
        downvotes,
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true, 
      message: 'Downvote registered',
      reviewId,
      userId,
      upvotes,
      downvotes
    });
  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({ error: 'Failed to process downvote' });
  }
});

// Remove vote (undo upvote/downvote)
router.post('/remove-vote', async (req, res) => {
  try {
    const { reviewId, userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Delete the vote
    await prisma.reviewVotes.deleteMany({
      where: {
        userId,
        reviewId
      }
    });

    // Get updated vote counts
    const upvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'UPVOTE' }
    });
    const downvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'DOWNVOTE' }
    });

    // Emit to all connected clients
    if (ioInstance) {
      ioInstance.emit('review:vote-removed', {
        reviewId,
        userId,
        upvotes,
        downvotes,
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true, 
      message: 'Vote removed',
      reviewId,
      userId,
      upvotes,
      downvotes
    });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({ error: 'Failed to remove vote' });
  }
});

// Get user's vote status for a review
router.get('/user-vote/:reviewId/:userId', async (req, res) => {
  try {
    const { reviewId, userId } = req.params;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Check if user has voted
    const userVote = await prisma.reviewVotes.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    res.json({
      reviewId,
      userId,
      voteType: userVote?.voteType || null,
      hasVoted: !!userVote
    });
  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({ error: 'Failed to get user vote status' });
  }
});

// Get interaction stats for a review
router.get('/stats/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Get vote counts
    const upvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'UPVOTE' }
    });
    const downvotes = await prisma.reviewVotes.count({
      where: { reviewId, voteType: 'DOWNVOTE' }
    });

    // Get comment count
    const comments = await prisma.reviewComments.count({
      where: { reviewId }
    });

    const stats = {
      reviewId,
      upvotes,
      downvotes,
      comments,
      shares: 0 // TODO: Implement shares tracking
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get interaction stats' });
  }
});

export default router;