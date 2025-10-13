import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';
import { analyzeStance } from '../utils/stance-analysis';

// Create a new comment with stance detection
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, userId, reviewId, parentCommentId } = req.body;

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

    // Create the comment first
    const newComment = await prisma.reviewComments.create({
      data: {
        content,
        userId,
        reviewId,
        parentCommentId,
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

    // Perform stance analysis asynchronously
    console.log('Starting stance analysis for comment:', newComment.id);
    analyzeStance({
      reviewText: review.reviewText,
      commentText: content,
    }).then(async (stanceResult) => {
      try {
        console.log('Stance analysis result:', stanceResult);
        if (stanceResult.result) {
          console.log('Updating comment with stance data:', {
            commentId: newComment.id,
            stance: stanceResult.result.stance,
            confidence: stanceResult.result.confidence
          });
          
          // Update the comment with stance data
          await prisma.reviewComments.update({
            where: { id: newComment.id },
            data: {
              stance: stanceResult.result.stance,
              stanceConfidence: stanceResult.result.confidence,
              stanceReasoning: stanceResult.result.reasoning,
              stanceAnalyzedAt: new Date(),
            },
          });

          console.log('Comment updated successfully with stance data');

          // Update the review's stance counts
          await updateReviewStanceCounts(reviewId);
          console.log('Review stance counts updated');
        } else {
          console.log('No stance result returned from analysis');
        }
      } catch (error) {
        console.error('Failed to update stance analysis:', error);
      }
    }).catch((error) => {
      console.error('Stance analysis failed:', error);
    });

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

    await prisma.reviews.update({
      where: { id: reviewId },
      data: counts,
    });
  } catch (error) {
    console.error('Error updating review stance counts:', error);
  }
}

// Re-analyze stance for all comments of a review (admin function)
export const reanalyzeReviewStances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;

    // Get the review and all its comments
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
      include: {
        comments: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    if (!review) {
      throw new ValidationError('Review not found');
    }

    // Analyze stance for all comments
    let successCount = 0;
    let errorCount = 0;

    for (const comment of review.comments) {
      try {
        const stanceResult = await analyzeStance({
          reviewText: review.reviewText,
          commentText: comment.content,
        });

        if (stanceResult.result) {
          await prisma.reviewComments.update({
            where: { id: comment.id },
            data: {
              stance: stanceResult.result.stance,
              stanceConfidence: stanceResult.result.confidence,
              stanceReasoning: stanceResult.result.reasoning,
              stanceAnalyzedAt: new Date(),
            },
          });
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Failed to analyze stance for comment ${comment.id}:`, error);
        errorCount++;
      }
    }

    // Update the review stance counts
    await updateReviewStanceCounts(reviewId);

    res.json({
      success: true,
      message: `Stance analysis completed: ${successCount} successful, ${errorCount} failed`,
      results: {
        total: review.comments.length,
        successful: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error('Error re-analyzing review stances:', error);
    next(error);
  }
};