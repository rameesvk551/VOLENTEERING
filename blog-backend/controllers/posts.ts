/**
 * Post Controller
 * Purpose: Handle HTTP requests for posts
 * Architecture: Controller layer - handles requests/responses
 */

import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/postService';
import { asyncHandler } from '../middlewares/errorHandler';

/**
 * @route   GET /api/posts
 * @desc    Get all posts with filtering and pagination
 * @access  Public
 */
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    category: req.query.category as string,
    tag: req.query.tag as string,
    search: req.query.search as string,
    sort: req.query.sort as 'date' | 'title' | 'popular',
  };

  const result = await postService.getAllPosts(query);

  res.status(200).json({
    status: 'success',
    data: result.posts,
    pagination: result.pagination,
  });
});

/**
 * @route   GET /api/posts/:slug
 * @desc    Get single post by slug
 * @access  Public
 */
export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostBySlug(req.params.slug);

  res.status(200).json({
    status: 'success',
    data: post,
  });
});

/**
 * @route   GET /api/posts/id/:id
 * @desc    Get single post by ID
 * @access  Public
 */
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: post,
  });
});

/**
 * @route   POST /api/posts
 * @desc    Create new post
 * @access  Private (Admin)
 */
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.createPost(req.body);

  res.status(201).json({
    status: 'success',
    data: post,
    message: 'Post created successfully',
  });
});

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post by ID
 * @access  Private (Admin)
 */
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.updatePost(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: post,
    message: 'Post updated successfully',
  });
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post by ID
 * @access  Private (Admin)
 */
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await postService.deletePost(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Post deleted successfully',
  });
});

/**
 * @route   GET /api/posts/meta/categories
 * @desc    Get all categories with counts
 * @access  Public
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await postService.getCategories();

  res.status(200).json({
    status: 'success',
    data: categories,
  });
});

/**
 * @route   GET /api/posts/meta/tags
 * @desc    Get all tags with counts
 * @access  Public
 */
export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await postService.getTags();

  res.status(200).json({
    status: 'success',
    data: tags,
  });
});