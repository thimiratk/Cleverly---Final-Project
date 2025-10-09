import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/domain.controller';

const router = express.Router();

// Categories
router.route('/categories')
  .get(getCategories)
  .post(createCategory);

router.route('/categories/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

// Subcategories
router.route('/subcategories')
  .get(getSubCategories)
  .post(createSubCategory);

router.route('/subcategories/:id')
  .get(getSubCategoryById)
  .put(updateSubCategory)
  .delete(deleteSubCategory);

// Get subcategories by category
router.get('/categories/:categoryId/subcategories', getSubCategoriesByCategory);

export default router;
