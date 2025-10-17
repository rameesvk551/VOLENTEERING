/**
 * Post Routes
 * Purpose: Define API endpoints for posts
 * Architecture: Express Router with validation middleware
 */

import { Router } from 'express';
import * as postController from '../controllers/posts';
import {
  validatePostCreation,
  validatePostUpdate,
  validatePostQuery,
  validateSlugParam,
} from '../middlewares/validation';

const router = Router();

// Meta endpoints (categories, tags)
router.get('/meta/categories', postController.getCategories);
router.get('/meta/tags', postController.getTags);

// CRUD endpoints
router.get('/', validatePostQuery, postController.getPosts);
router.get('/:slug', validateSlugParam, postController.getPostBySlug);
router.get('/id/:id', postController.getPostById);
router.post('/', validatePostCreation, postController.createPost);
router.put('/:id', validatePostUpdate, postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;