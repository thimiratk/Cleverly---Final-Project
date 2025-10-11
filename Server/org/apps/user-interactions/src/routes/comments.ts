import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Store io instance (will be set by main.ts)
let ioInstance: any = null;

export const setSocketIO = (io: any) => {
  ioInstance = io;
};

// Add a comment to a review
router.post('/add', async (req, res): Promise<void> => {
  try {
    const { reviewId, userId, content, parentCommentId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment content is required' });
      return;
    }

    // Create comment in database
    const newComment = await prisma.reviewComments.create({
      data: {
        reviewId,
        userId,
        content: content.trim(),
        parentCommentId: parentCommentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    // Emit real-time comment to all users viewing this review
    if (ioInstance) {
      ioInstance.to(`review:${reviewId}`).emit('comment:new', newComment);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Comment added successfully',
      comment: newComment 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for a review
router.get('/review/:reviewId', async (req, res): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { page = 1, limit = 20, sortBy = 'newest' } = req.query;
    const prisma: PrismaClient = req.app.locals.prisma;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Define sort order
    const orderBy = sortBy === 'oldest' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

    // Get comments (only top-level, not replies)
    const comments = await prisma.reviewComments.findMany({
      where: {
        reviewId,
        parentCommentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            },
            _count: {
              select: {
                likes: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      },
      orderBy,
      skip,
      take: limitNum
    });

    // Get total count
    const totalCount = await prisma.reviewComments.count({
      where: {
        reviewId,
        parentCommentId: null
      }
    });

    res.json({
      reviewId,
      comments,
      totalCount,
      page: pageNum,
      limit: limitNum,
      sortBy
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Update a comment
router.put('/:commentId', async (req, res): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content, userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment content is required' });
      return;
    }

    // Verify user owns the comment
    const existingComment = await prisma.reviewComments.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (existingComment.userId !== userId) {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    // Update comment
    const updatedComment = await prisma.reviewComments.update({
      where: { id: commentId },
      data: { 
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    // Emit real-time update
    if (ioInstance) {
      ioInstance.emit('comment:updated', updatedComment);
    }

    res.json({ 
      success: true, 
      message: 'Comment updated successfully',
      comment: updatedComment 
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/:commentId', async (req, res): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Verify user owns the comment
    const existingComment = await prisma.reviewComments.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (existingComment.userId !== userId) {
      res.status(403).json({ error: 'You can only delete your own comments' });
      return;
    }

    // Delete comment and all its replies
    await prisma.reviewComments.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentCommentId: commentId }
        ]
      }
    });

    // Emit real-time deletion
    if (ioInstance) {
      ioInstance.emit('comment:deleted', { commentId, deletedBy: userId });
    }

    res.json({ 
      success: true, 
      message: 'Comment deleted successfully',
      commentId 
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Like a comment
router.post('/:commentId/like', async (req, res): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Check if already liked
    const existingLike = await prisma.commentLikes.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    if (existingLike) {
      res.status(400).json({ error: 'Comment already liked' });
      return;
    }

    // Create like
    await prisma.commentLikes.create({
      data: {
        userId,
        commentId
      }
    });

    // Get updated like count
    const likeCount = await prisma.commentLikes.count({
      where: { commentId }
    });

    // Emit real-time like
    if (ioInstance) {
      ioInstance.emit('comment:liked', { 
        commentId, 
        userId, 
        likeCount,
        timestamp: new Date() 
      });
    }

    res.json({ 
      success: true, 
      message: 'Comment liked successfully',
      commentId,
      userId,
      likeCount
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Unlike a comment
router.post('/:commentId/unlike', async (req, res): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    // Delete like
    await prisma.commentLikes.deleteMany({
      where: {
        userId,
        commentId
      }
    });

    // Get updated like count
    const likeCount = await prisma.commentLikes.count({
      where: { commentId }
    });

    // Emit real-time unlike
    if (ioInstance) {
      ioInstance.emit('comment:unliked', { 
        commentId, 
        userId, 
        likeCount,
        timestamp: new Date() 
      });
    }

    res.json({ 
      success: true, 
      message: 'Comment unliked successfully',
      commentId,
      userId,
      likeCount
    });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

export default router;