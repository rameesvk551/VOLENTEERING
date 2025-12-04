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
  getTags,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  getBlogByIdForEdit,
  getAllBlogsForAdmin,
  getSitemap,
  getRobotsTxt
} from '../controllers/blog.controller.js';
import validators from '../validators/blog.validators.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/posts', getAllBlogs); // Alias for /api/blog/
router.get('/featured', getFeaturedBlogs);
router.get('/popular', getPopularBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/categories/list', getCategories);
router.get('/tags/list', getTags);
router.get('/category/:category', getBlogsByCategory);
router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobotsTxt);

// Admin/Internal routes for CRUD operations
router.post('/', validators.createBlogValidators, createBlog);  // Create blog
router.get('/all', getAllBlogsForAdmin);  // Get all blogs including drafts
router.get('/edit/:id', getBlogByIdForEdit);  // Get blog by ID for editing
router.put('/:id', validators.updateBlogValidators, updateBlog);  // Update blog
router.delete('/:id', validators.idParamValidator, deleteBlog);  // Delete blog
router.post('/:id/publish', validators.idParamValidator, publishBlog);  // Publish blog

// Public blog detail routes (must be after specific routes)
router.get('/id/:id', getBlogById);
router.get('/:slug', getBlogBySlug);

// Protected routes (optional auth - handled by headers)
router.post('/:id/like', validators.idParamValidator, toggleLike);
router.post('/:id/rate', validators.rateValidator, rateBlog);
router.get('/:id/rating', validators.idParamValidator, getUserRating);

export default router;
