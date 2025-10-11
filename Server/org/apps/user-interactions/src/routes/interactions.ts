import express from 'express';
import { PrismaClient } from '@prisma/client';

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