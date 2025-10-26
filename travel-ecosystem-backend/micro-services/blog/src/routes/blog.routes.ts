import express from 'express';
import {
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  getBlogsByCategory,
  getFeaturedBlogs,
  getPopularBlogs,
  getTrendingBlogs,
  toggleLike,
  rateBlog,
  getUserRating,
  getCategories,
  getTags
} from '../controllers/blog.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/popular', getPopularBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/categories/list', getCategories);
router.get('/tags/list', getTags);
router.get('/category/:category', getBlogsByCategory);
router.get('/id/:id', getBlogById);
router.get('/:slug', getBlogBySlug);

// Protected routes (optional auth - handled by headers)
router.post('/:id/like', toggleLike);
router.post('/:id/rate', rateBlog);
router.get('/:id/rating', getUserRating);

export default router;
