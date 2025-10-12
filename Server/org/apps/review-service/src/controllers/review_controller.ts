import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';
import { deleteAssetsByUrls } from '../utils/cloudinary';

// Create a new review
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      categoryId, 
      subCategoryId, 
      exceptionalCategory, 
      exceptionalSubCategory,
      productOrService, 
      product, 
      rating, 
      reviewText, 
      photos, 
      videos, 
      userId 
    } = req.body;

    // Validate required fields
    if (!productOrService || !product || !rating || !reviewText || !userId) {
      throw new ValidationError('Missing required fields: productOrService, product, rating, reviewText, userId');
    }

    // Check if it's an exceptional review (custom category) or standard review
    const isExceptional = (!categoryId || categoryId.trim() === '') && (exceptionalCategory || exceptionalSubCategory);
    
    if (!isExceptional && (!categoryId || categoryId.trim() === '')) {
      throw new ValidationError('Either categoryId or exceptionalCategory is required');
    }

    const reviewData: any = {
      productOrService,
      product,
      rating,
      reviewText,
      photos: photos || [],
      videos: videos || [],
      userId,
      isExceptional,
    };

    if (isExceptional) {
      // Handle exceptional (custom) categories
      reviewData.exceptionalCategory = exceptionalCategory;
      reviewData.exceptionalSubCategory = exceptionalSubCategory;
    } else {
      // Handle standard categories - only add if not empty
      if (categoryId && categoryId.trim() !== '') {
        reviewData.categoryId = categoryId;
      }
      if (subCategoryId && subCategoryId.trim() !== '') {
        reviewData.subCategoryId = subCategoryId;
      }
    }

    const newReview = await prisma.reviews.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            avatar: {
              select: {
                url: true,
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    next(error);
  }
};

// Update an existing review (text and media only)
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.id;
    const { reviewText, photos, videos, userId } = req.body;

    if (!userId) {
      throw new ValidationError('userId is required');
    }

    const existingReview = await prisma.reviews.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
        reviewText: true,
        photos: true,
        videos: true,
      },
    });

    if (!existingReview) {
      throw new ValidationError('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new ValidationError('You are not authorized to edit this review');
    }

    let normalizedReviewText = existingReview.reviewText;
    if (typeof reviewText === 'string') {
      const trimmed = reviewText.trim();
      if (trimmed.length === 0) {
        throw new ValidationError('Review text cannot be empty');
      }
      normalizedReviewText = trimmed;
    }

    const submittedPhotos = Array.isArray(photos) ? photos : existingReview.photos;
    const submittedVideos = Array.isArray(videos) ? videos : existingReview.videos;

    const removedPhotos = existingReview.photos.filter((photoUrl: string) => !submittedPhotos.includes(photoUrl));
    const removedVideos = existingReview.videos.filter((videoUrl: string) => !submittedVideos.includes(videoUrl));

    if (removedPhotos.length > 0) {
      await deleteAssetsByUrls(removedPhotos);
    }
    if (removedVideos.length > 0) {
      await deleteAssetsByUrls(removedVideos);
    }

    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        reviewText: normalizedReviewText,
        photos: submittedPhotos,
        videos: submittedVideos,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review and associated media/interactions
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      throw new ValidationError('userId is required');
    }

    const existingReview = await prisma.reviews.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
        photos: true,
        videos: true,
      },
    });

    if (!existingReview) {
      throw new ValidationError('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new ValidationError('You are not authorized to delete this review');
    }

    const mediaToDelete = [...(existingReview.photos || []), ...(existingReview.videos || [])];
    if (mediaToDelete.length > 0) {
      await deleteAssetsByUrls(mediaToDelete);
    }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const relatedComments = await tx.reviewComments.findMany({
        where: { reviewId },
        select: { id: true },
      });

  const commentIds = relatedComments.map((comment: { id: string }) => comment.id);

      if (commentIds.length > 0) {
        await tx.commentLikes.deleteMany({
          where: {
            commentId: {
              in: commentIds,
            },
          },
        });
      }

      await tx.reviewComments.deleteMany({ where: { reviewId } });
      await tx.reviewVotes.deleteMany({ where: { reviewId } });
      await tx.reviews.delete({ where: { id: reviewId } });
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews with optional filters
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, subCategoryId, productOrService, userId } = req.query;

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (productOrService) filters.productOrService = productOrService;
    if (userId) filters.userId = userId; // Add user filtering

    const reviews = await prisma.reviews.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            avatar: {
              select: {
                url: true,
              }
            }
          }
        },
        comments: true,
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// Get count of reviews
export const getReviewCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.reviews.count();
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

// Get exceptional reviews (for admin dashboard)
export const getExceptionalReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exceptionalReviews = await prisma.reviews.findMany({
      where: { isExceptional: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            avatar: {
              select: {
                url: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(exceptionalReviews);
  } catch (error) {
    next(error);
  }
};

// Convert exceptional review to standard categories
export const convertExceptionalReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { categoryId, subCategoryId } = req.body;

    if (!categoryId) {
      throw new ValidationError('categoryId is required');
    }

    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        categoryId,
        subCategoryId: subCategoryId || null,
        isExceptional: false,
        exceptionalCategory: null,
        exceptionalSubCategory: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// Create category from exceptional review
export const createCategoryFromExceptional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { categoryName } = req.body;

    if (!categoryName) {
      throw new ValidationError('categoryName is required');
    }

    // First check if the review exists and has exceptional category
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
      select: { 
        exceptionalCategory: true, 
        isExceptional: true,
        exceptionalSubCategory: true 
      }
    });

    if (!review || !review.isExceptional || !review.exceptionalCategory) {
      throw new ValidationError('Review not found or does not have exceptional category');
    }

    // Create new category
    const newCategory = await prisma.categories.create({
      data: { name: categoryName }
    });

    // Update the review to use the new category
    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        categoryId: newCategory.id,
        exceptionalCategory: null,
        // Keep subcategory as exceptional if it exists
        isExceptional: !!review.exceptionalSubCategory,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            avatar: {
              select: {
                url: true,
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(201).json({
      category: newCategory,
      review: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

// Create subcategory from exceptional review
export const createSubCategoryFromExceptional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { subcategoryName, categoryId } = req.body;

    if (!subcategoryName || !categoryId) {
      throw new ValidationError('subcategoryName and categoryId are required');
    }

    // First check if the review exists and has exceptional subcategory
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
      select: { 
        exceptionalSubCategory: true, 
        isExceptional: true,
        categoryId: true 
      }
    });

    if (!review || !review.exceptionalSubCategory) {
      throw new ValidationError('Review not found or does not have exceptional subcategory');
    }

    // Create new subcategory
    const newSubCategory = await prisma.subCategories.create({
      data: { 
        name: subcategoryName,
        categoryId: categoryId 
      }
    });

    // Update the review to use the new subcategory
    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        subCategoryId: newSubCategory.id,
        exceptionalSubCategory: null,
        categoryId: categoryId, // Ensure category is set
        isExceptional: false, // No more exceptional data
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            avatar: {
              select: {
                url: true,
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(201).json({
      subcategory: newSubCategory,
      review: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total reviews count
    const totalReviews = await prisma.reviews.count();

    // Get exceptional reviews count
    const exceptionalReviews = await prisma.reviews.count({
      where: { isExceptional: true }
    });

    // Get reviews by rating distribution
    const ratingDistribution = await prisma.reviews.groupBy({
      by: ['rating'],
      _count: { rating: true },
      orderBy: { rating: 'asc' }
    });

    // Get recent reviews (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReviews = await prisma.reviews.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Get most popular categories
    const popularCategories = await prisma.reviews.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
      where: {
        categoryId: { not: null },
        isExceptional: false
      },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 5
    });

    // Get category names for popular categories
    const categoryIds = popularCategories.map((cat: any) => cat.categoryId).filter(Boolean);
    const categories = await prisma.categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const popularCategoriesWithNames = popularCategories.map((cat: any) => ({
      ...cat,
      categoryName: categories.find((c: any) => c.id === cat.categoryId)?.name || 'Unknown'
    }));

    // Get most active reviewers (top 5)
    const activeReviewers = await prisma.reviews.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 5
    });

    // Get user names for active reviewers
    const userIds = activeReviewers.map((reviewer: any) => reviewer.userId);
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    const activeReviewersWithNames = activeReviewers.map((reviewer: any) => ({
      ...reviewer,
      user: users.find((u: any) => u.id === reviewer.userId)
    }));

    // Get exceptional categories list (for admin to convert)
    const uniqueExceptionalCategories = await prisma.reviews.findMany({
      where: { 
        isExceptional: true,
        exceptionalCategory: { not: null }
      },
      select: { 
        exceptionalCategory: true,
        exceptionalSubCategory: true 
      },
      distinct: ['exceptionalCategory']
    });

    const stats = {
      overview: {
        totalReviews,
        exceptionalReviews,
        recentReviews,
        conversionRate: totalReviews > 0 ? ((totalReviews - exceptionalReviews) / totalReviews * 100).toFixed(1) : 0
      },
      ratingDistribution: ratingDistribution.map((rating: any) => ({
        rating: rating.rating,
        count: rating._count.rating
      })),
      popularCategories: popularCategoriesWithNames,
      activeReviewers: activeReviewersWithNames,
      exceptionalCategories: uniqueExceptionalCategories.map((review: any) => ({
        category: review.exceptionalCategory,
        subcategory: review.exceptionalSubCategory
      })).filter((cat: any) => cat.category) // Remove nulls
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    next(error);
  }
};
