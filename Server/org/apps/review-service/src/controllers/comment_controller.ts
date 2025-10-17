import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';

// Create a new comment (stance detection now handled in frontend)
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, userId, reviewId, parentCommentId, stance, stanceConfidence, stanceReasoning } = req.body;

    // DEBUG: Log all received data
    console.log('[CREATE COMMENT] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[CREATE COMMENT] Extracted stance:', stance);
    console.log('[CREATE COMMENT] Extracted stanceConfidence:', stanceConfidence);
    console.log('[CREATE COMMENT] Extracted stanceReasoning:', stanceReasoning);

    if (!content || !userId || !reviewId) {
      throw new ValidationError('Missing required fields: content, userId, reviewId');
    }

    // Validate that the review exists
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
      select: { id: true, reviewText: true },
    });

    if (!review) {
      throw new ValidationError('Review not found');
    }

    // Validate parent comment if provided
    if (parentCommentId) {
      const parentComment = await prisma.reviewComments.findUnique({
        where: { id: parentCommentId },
        select: { id: true, reviewId: true },
      });

      if (!parentComment) {
        throw new ValidationError('Parent comment not found');
      }

      if (parentComment.reviewId !== reviewId) {
        throw new ValidationError('Parent comment does not belong to this review');
      }
    }

    // Create the comment with stance data from frontend
    const newComment = await prisma.reviewComments.create({
      data: {
        content,
        userId,
        reviewId,
        parentCommentId,
        // Stance fields from frontend
        stance: stance || null,
        stanceConfidence: stanceConfidence || null,
        stanceReasoning: stanceReasoning || null,
        stanceAnalyzedAt: stance ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            likes: true,
          },
        },
      },
    });

    // Update review stance counts if stance was provided
    if (stance) {
      console.log(`[Stance Update] Comment stance: ${stance}, Confidence: ${stanceConfidence}, ReviewId: ${reviewId}`);
      await updateReviewStanceCounts(reviewId);
      console.log(`[Stance Update] Review stance counts updated for reviewId: ${reviewId}`);
    } else {
      console.log(`[Stance Update] No stance provided for comment, skipping stance count update`);
    }

    // Update comments count on the review
    await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    next(error);
  }
};

// Get comments for a review
export const getCommentsByReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const comments = await prisma.reviewComments.findMany({
      where: {
        reviewId,
        parentCommentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            likes: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limitNum,
    });

    const totalComments = await prisma.reviewComments.count({
      where: {
        reviewId,
        parentCommentId: null,
      },
    });

    res.json({
      success: true,
      comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalComments,
        pages: Math.ceil(totalComments / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    next(error);
  }
};

// Get stance analysis for a specific comment
export const getCommentStance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.reviewComments.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        stance: true,
        stanceConfidence: true,
        stanceReasoning: true,
        stanceAnalyzedAt: true,
      },
    });

    if (!comment) {
      throw new ValidationError('Comment not found');
    }

    res.json({
      success: true,
      stance: {
        stance: comment.stance,
        confidence: comment.stanceConfidence,
        reasoning: comment.stanceReasoning,
        analyzedAt: comment.stanceAnalyzedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching comment stance:', error);
    next(error);
  }
};

// Update review stance counts based on all its comments
async function updateReviewStanceCounts(reviewId: string) {
  try {
    console.log(`[updateReviewStanceCounts] Starting stance count update for reviewId: ${reviewId}`);
    
    const stanceCounts = await prisma.reviewComments.groupBy({
      by: ['stance'],
      where: {
        reviewId,
        stance: {
          not: null,
        },
      },
      _count: {
        stance: true,
      },
    });

    console.log(`[updateReviewStanceCounts] Found stance groups:`, JSON.stringify(stanceCounts, null, 2));

    const counts = {
      agreeCount: 0,
      disagreeCount: 0,
      neutralStanceCount: 0,
    };

    stanceCounts.forEach((group: { stance: string | null; _count: { stance: number } }) => {
      const count = group._count.stance;
      switch (group.stance) {
        case 'AGREE':
          counts.agreeCount = count;
          break;
        case 'DISAGREE':
          counts.disagreeCount = count;
          break;
        case 'NEUTRAL':
          counts.neutralStanceCount = count;
          break;
      }
    });

    console.log(`[updateReviewStanceCounts] Calculated counts:`, counts);

    await prisma.reviews.update({
      where: { id: reviewId },
      data: counts,
    });
    
    console.log(`[updateReviewStanceCounts] Successfully updated review stance counts`);
  } catch (error) {
    console.error('Error updating review stance counts:', error);
  }
}

// Re-analyze stance for all comments of a review (admin function)
// NOTE: This function is deprecated as stance detection is now handled in frontend
export const reanalyzeReviewStances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;

    // Just recalculate the stance counts from existing stance data
    await updateReviewStanceCounts(reviewId);

    res.json({
      success: true,
      message: 'Stance counts recalculated from existing comment stance data',
    });
  } catch (error) {
    console.error('Error recalculating review stance counts:', error);
    next(error);
  }
};