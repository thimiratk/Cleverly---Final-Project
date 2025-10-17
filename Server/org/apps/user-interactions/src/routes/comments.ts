import express from 'express';
import { PrismaClient } from '../../../../generated/prisma';
import { createNotification, broadcastNotification } from '../utils/notifications';

const router = express.Router();

// Store io instance (will be set by main.ts)
let ioInstance: any = null;

export const setSocketIO = (io: any) => {
  ioInstance = io;
};

// Add a comment to a review
router.post('/add', async (req, res): Promise<void> => {
  try {
    const { reviewId, userId, content, parentCommentId, stance, stanceConfidence, stanceReasoning } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment content is required' });
      return;
    }

    // Prepare comment data
    const commentData: any = {
      reviewId,
      userId,
      content: content.trim(),
      parentCommentId: parentCommentId || null
    };

    // Add stance data if provided
    if (stance) {
      console.log('[Comments] Saving stance data:', { stance, stanceConfidence, stanceReasoning });
      commentData.stance = stance;
      commentData.stanceConfidence = stanceConfidence;
      commentData.stanceReasoning = stanceReasoning;
      commentData.stanceAnalyzedAt = new Date();
    }

    // Create comment in database
    const newComment = await prisma.reviewComments.create({
      data: commentData,
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

    // Update stance counts on the review if stance was detected
    if (stance && !parentCommentId) { // Only count top-level comments
      const stanceUpper = stance.toUpperCase();
      if (stanceUpper === 'AGREE') {
        await prisma.reviews.update({
          where: { id: reviewId },
          data: { agreeCount: { increment: 1 } }
        });
        console.log('[Comments] Incremented agreeCount for review:', reviewId);
      } else if (stanceUpper === 'DISAGREE') {
        await prisma.reviews.update({
          where: { id: reviewId },
          data: { disagreeCount: { increment: 1 } }
        });
        console.log('[Comments] Incremented disagreeCount for review:', reviewId);
      } else if (stanceUpper === 'NEUTRAL') {
        await prisma.reviews.update({
          where: { id: reviewId },
          data: { neutralStanceCount: { increment: 1 } }
        });
        console.log('[Comments] Incremented neutralStanceCount for review:', reviewId);
      }
    }

    // Create notification for review author or parent comment author
    try {
      const commenter = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true, username: true }
      });

      if (parentCommentId) {
        // Reply to a comment - notify the parent comment author
        const parentComment = await prisma.reviewComments.findUnique({
          where: { id: parentCommentId },
          select: { userId: true }
        });

        if (parentComment && parentComment.userId !== userId) {
          const notification = await createNotification({
            userId: parentComment.userId,
            type: 'COMMENT',
            title: 'New Reply',
            message: `${commenter?.username || commenter?.name} replied to your comment`,
            data: { reviewId, commentId: newComment.id, parentCommentId },
            relatedUserId: userId
          });

          if (notification) {
            broadcastNotification(ioInstance, parentComment.userId, notification);
          }
        }
      } else {
        // Top-level comment - notify the review author
        const review = await prisma.reviews.findUnique({
          where: { id: reviewId },
          select: { userId: true }
        });

        if (review && review.userId !== userId) {
          const notification = await createNotification({
            userId: review.userId,
            type: 'COMMENT',
            title: 'New Comment',
            message: `${commenter?.username || commenter?.name} commented on your review`,
            data: { reviewId, commentId: newComment.id },
            relatedUserId: userId
          });

          if (notification) {
            broadcastNotification(ioInstance, review.userId, notification);
          }
        }
      }
    } catch (notifError) {
      console.error('Error creating comment notification:', notifError);
    }

    // Emit real-time comment to all users viewing this review
    if (ioInstance) {
      ioInstance.to(`review:${reviewId}`).emit('comment:new', newComment);
    }

    const responseComment = {
      ...newComment,
      likedByCurrentUser: false
    };

    res.status(201).json({ 
      success: true, 
      message: 'Comment added successfully',
      comment: responseComment 
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
    const { page = 1, limit = 20, sortBy = 'newest', userId } = req.query as {
      page?: string;
      limit?: string;
      sortBy?: string;
      userId?: string;
    };
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

    let likedSet = new Set<string>();

    if (userId) {
      const commentIds: string[] = [];
      const collectIds = (list: typeof comments) => {
        list.forEach((comment) => {
          commentIds.push(comment.id);
          if (comment.replies && comment.replies.length > 0) {
            // Replies are typed as any because Prisma nested type union
            collectIds(comment.replies as any);
          }
        });
      };

      collectIds(comments);

      if (commentIds.length > 0) {
        const likedEntries = await prisma.commentLikes.findMany({
          where: {
            userId,
            commentId: {
              in: commentIds
            }
          },
          select: {
            commentId: true
          }
        });
        likedSet = new Set(likedEntries.map((entry) => entry.commentId));
      }
    }

    const applyLikedFlag = (list: typeof comments): any[] => {
      return list.map((comment) => ({
        ...comment,
        likedByCurrentUser: likedSet.has(comment.id),
        replies: comment.replies && comment.replies.length > 0
          ? applyLikedFlag(comment.replies as any)
          : comment.replies
      }));
    };

    const enrichedComments = applyLikedFlag(comments);

    // Get total count
    const totalCount = await prisma.reviewComments.count({
      where: {
        reviewId,
        parentCommentId: null
      }
    });

    res.json({
      reviewId,
      comments: enrichedComments,
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
    const { content, userId, stance, stanceConfidence, stanceReasoning } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment content is required' });
      return;
    }

    // Verify user owns the comment
    const existingComment = await prisma.reviewComments.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        reviewId: true,
        stance: true,
        parentCommentId: true
      }
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (existingComment.userId !== userId) {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    // Store old stance for count adjustment
    const oldStance = existingComment.stance;
    const reviewId = existingComment.reviewId;

    // Prepare update data
    const updateData: any = { 
      content: content.trim(),
      updatedAt: new Date()
    };

    // Add new stance data if provided
    if (stance) {
      console.log('[Update Comment] New stance data:', { stance, stanceConfidence, stanceReasoning });
      updateData.stance = stance;
      updateData.stanceConfidence = stanceConfidence;
      updateData.stanceReasoning = stanceReasoning;
      updateData.stanceAnalyzedAt = new Date();
    }

    // Update comment
    const updatedComment = await prisma.reviewComments.update({
      where: { id: commentId },
      data: updateData,
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

    // Update review stance counts if stance changed
    if (reviewId && stance && oldStance !== stance) {
      // Decrement old stance count
      if (oldStance) {
        const oldStanceUpper = oldStance.toUpperCase();
        let decrementField: 'agreeCount' | 'disagreeCount' | 'neutralStanceCount' | null = null;

        if (oldStanceUpper === 'AGREE') {
          decrementField = 'agreeCount';
        } else if (oldStanceUpper === 'DISAGREE') {
          decrementField = 'disagreeCount';
        } else if (oldStanceUpper === 'NEUTRAL') {
          decrementField = 'neutralStanceCount';
        }

        if (decrementField) {
          await prisma.reviews.update({
            where: { id: reviewId },
            data: { [decrementField]: { decrement: 1 } }
          });
          console.log(`[Update Comment] Decremented ${decrementField} for review:`, reviewId);
        }
      }

      // Increment new stance count
      const newStanceUpper = stance.toUpperCase();
      let incrementField: 'agreeCount' | 'disagreeCount' | 'neutralStanceCount' | null = null;

      if (newStanceUpper === 'AGREE') {
        incrementField = 'agreeCount';
      } else if (newStanceUpper === 'DISAGREE') {
        incrementField = 'disagreeCount';
      } else if (newStanceUpper === 'NEUTRAL') {
        incrementField = 'neutralStanceCount';
      }

      if (incrementField) {
        await prisma.reviews.update({
          where: { id: reviewId },
          data: { [incrementField]: { increment: 1 } }
        });
        console.log(`[Update Comment] Incremented ${incrementField} for review:`, reviewId);
      }
    }

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
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        reviewId: true,
        stance: true,
        parentCommentId: true
      }
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (existingComment.userId !== userId) {
      res.status(403).json({ error: 'You can only delete your own comments' });
      return;
    }

    // Store info before deletion
    const reviewId = existingComment.reviewId;
    const stance = existingComment.stance;

    // Get all replies to update stance counts
    const replies = await prisma.reviewComments.findMany({
      where: { parentCommentId: commentId },
      select: { stance: true, parentCommentId: true }
    });

    // Delete comment and all its replies
    await prisma.reviewComments.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentCommentId: commentId }
        ]
      }
    });

    // Update stance counts on review if needed
    // Only top-level comments and replies affect stance counts
    if (stance && reviewId) {
      const stanceUpper = stance.toUpperCase();
      let decrementField: 'agreeCount' | 'disagreeCount' | 'neutralStanceCount' | null = null;

      if (stanceUpper === 'AGREE') {
        decrementField = 'agreeCount';
      } else if (stanceUpper === 'DISAGREE') {
        decrementField = 'disagreeCount';
      } else if (stanceUpper === 'NEUTRAL') {
        decrementField = 'neutralStanceCount';
      }

      if (decrementField) {
        await prisma.reviews.update({
          where: { id: reviewId },
          data: { [decrementField]: { decrement: 1 } }
        });
        console.log(`[Delete Comment] Decremented ${decrementField} for review:`, reviewId);
      }
    }

    // Also decrement stance counts for deleted replies
    for (const reply of replies) {
      if (reply.stance && reviewId) {
        const stanceUpper = reply.stance.toUpperCase();
        let decrementField: 'agreeCount' | 'disagreeCount' | 'neutralStanceCount' | null = null;

        if (stanceUpper === 'AGREE') {
          decrementField = 'agreeCount';
        } else if (stanceUpper === 'DISAGREE') {
          decrementField = 'disagreeCount';
        } else if (stanceUpper === 'NEUTRAL') {
          decrementField = 'neutralStanceCount';
        }

        if (decrementField) {
          await prisma.reviews.update({
            where: { id: reviewId },
            data: { [decrementField]: { decrement: 1 } }
          });
          console.log(`[Delete Comment] Decremented ${decrementField} for reply in review:`, reviewId);
        }
      }
    }

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

    // Create notification for comment author
    try {
      const comment = await prisma.reviewComments.findUnique({
        where: { id: commentId },
        select: { userId: true, reviewId: true }
      });

      if (comment && comment.userId !== userId) {
        const liker = await prisma.users.findUnique({
          where: { id: userId },
          select: { name: true, username: true }
        });

        const notification = await createNotification({
          userId: comment.userId,
          type: 'COMMENT_LIKE',
          title: 'Comment Liked',
          message: `${liker?.username || liker?.name} liked your comment`,
          data: { commentId, reviewId: comment.reviewId },
          relatedUserId: userId
        });

        if (notification) {
          broadcastNotification(ioInstance, comment.userId, notification);
        }
      }
    } catch (notifError) {
      console.error('Error creating comment like notification:', notifError);
    }

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