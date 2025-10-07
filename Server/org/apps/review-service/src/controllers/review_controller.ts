import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';

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
    const isExceptional = !categoryId && (exceptionalCategory || exceptionalSubCategory);
    
    if (!isExceptional && !categoryId) {
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
      // Handle standard categories
      reviewData.categoryId = categoryId;
      if (subCategoryId) {
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

// Update an existing review
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.id;
    const { categoryId, subCategoryId, productOrService, product, rating, reviewText, photos, videos } = req.body;

    const existingReview = await prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!existingReview) {
      throw new ValidationError('Review not found');
    }

    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        categoryId,
        subCategoryId,
        productOrService,
        product,
        rating,
        reviewText,
        photos,
        videos,
      },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// Get reviews with optional filters
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, subCategoryId, productOrService } = req.query;

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (productOrService) filters.productOrService = productOrService;

    const reviews = await prisma.reviews.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
