import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';

// Create a new review
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, subCategoryId, productOrService, product, rating, reviewText, photos, videos, userId } = req.body;

    if (!categoryId || !productOrService || !product || !rating || !reviewText || !userId) {
      throw new ValidationError('Missing required fields');
    }

    const newReview = await prisma.reviews.create({
      data: {
        categoryId,
        subCategoryId,
        productOrService,
        product,
        rating,
        reviewText,
        photos: photos || [],
        videos: videos || [],
        userId,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

// Update an existing review
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.id;
    const { category, subCategory, productOrService, product, rating, reviewText, photos, videos } = req.body;

    const existingReview = await prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!existingReview) {
      throw new ValidationError('Review not found');
    }

    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        category,
        subCategory,
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
    const { category, subCategory, productOrService } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (subCategory) filters.subCategory = subCategory;
    if (productOrService) filters.productOrService = productOrService;

    const reviews = await prisma.reviews.findMany({
      where: filters,
      include: {
        user: true,
        comments: true,
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
