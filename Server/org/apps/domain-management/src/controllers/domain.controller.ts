import { Request, Response } from 'express';
import prisma from '@packages/libs/prisma';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        subCategories: true,
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        subCategories: true,
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Create new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.categories.create({
      data: { name },
      include: {
        subCategories: true,
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.categories.update({
      where: { id },
      data: { name },
      include: {
        subCategories: true,
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    res.json(category);
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First delete all subcategories that belong to this category
    await prisma.subCategories.deleteMany({
      where: { categoryId: id }
    });

    // Then delete the category itself
    await prisma.categories.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all subcategories
export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const subCategories = await prisma.subCategories.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });
    res.json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get subcategories by category ID
export const getSubCategoriesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await prisma.subCategories.findMany({
      where: { categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });
    res.json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get subcategory by ID
export const getSubCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subCategory = await prisma.subCategories.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(subCategory);
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new subcategory
export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Subcategory name and categoryId are required' });
    }

    // Verify category exists
    const category = await prisma.categories.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const subCategory = await prisma.subCategories.create({
      data: { name, categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    res.status(201).json(subCategory);
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update subcategory
export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Subcategory name and categoryId are required' });
    }

    // Verify category exists
    const category = await prisma.categories.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const subCategory = await prisma.subCategories.update({
      where: { id },
      data: { name, categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            product: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    res.json(subCategory);
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    console.error('Error updating subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete subcategory
export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.subCategories.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get categories with review counts for discover page
export const getCategoriesForDiscover = async (req: Request, res: Response) => {
  try {
    // Get all categories with review counts
    const categories = await prisma.categories.findMany({
      include: {
        _count: {
          select: {
            reviews: {
              where: {
                postState: { not: 'REJECTED' }
              }
            }
          }
        }
      }
    });

    // Get total review count
    const totalReviews = await prisma.reviews.count({
      where: {
        postState: { not: 'REJECTED' }
      }
    });

    // Format the response
    const formattedCategories = [
      {
        id: 'all',
        name: 'All Categories',
        count: totalReviews,
        reviews: 'reviews'
      },
      ...categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        count: category._count.reviews,
        reviews: 'reviews'
      }))
    ];

    console.log(`Found ${formattedCategories.length} categories for discover page`);
    return res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories for discover:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
