import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import axios from 'axios';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

// Blog service URL - Direct service-to-service communication
// In production, this could be:
// - Service discovery (Consul, etcd)
// - Kubernetes service DNS
// - Load balancer endpoint
const BLOG_SERVICE_URL = process.env.BLOG_SERVICE_URL || 'http://localhost:4003/api/blog';

// Create axios instance with timeout and retry logic
const blogServiceClient = axios.create({
  baseURL: BLOG_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
blogServiceClient.interceptors.request.use(
  (config) => {
    console.log(`[Blog Service] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
blogServiceClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[Blog Service Error] ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Blog service is unavailable';
    }
    return Promise.reject(error);
  }
);

// Helper function to forward user headers
const getUserHeaders = (req: any) => ({
  'X-User-Id': req.user?.id || req.user?._id,
  'X-User-Email': req.user?.email,
  'X-User-Name': req.user?.name || req.user?.username,
  'X-User-Role': req.user?.role
});

// Get all posts (including drafts)
router.get('/posts', async (req, res) => {
  try {
    const response = await blogServiceClient.get('/all', {
      params: req.query,
      headers: getUserHeaders(req)
    });
    res.json(response.data.data);
  } catch (error: any) {
    res.status(error.response?.status || 503).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch posts'
    });
  }
});

// Get single post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const response = await blogServiceClient.get(`/edit/${req.params.id}`, {
      headers: getUserHeaders(req)
    });
    res.json(response.data.data.blog);
  } catch (error: any) {
    res.status(error.response?.status || 503).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch post'
    });
  }
});

// Create new post
router.post('/posts', async (req, res) => {
  try {
    const response = await blogServiceClient.post('/', req.body, {
      headers: getUserHeaders(req)
    });
    res.status(201).json(response.data.data.blog);
  } catch (error: any) {
    res.status(error.response?.status || 503).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create post'
    });
  }
});

// Update post
router.put('/posts/:id', async (req, res) => {
  try {
    const response = await blogServiceClient.put(`/${req.params.id}`, req.body, {
      headers: getUserHeaders(req)
    });
    res.json(response.data.data.blog);
  } catch (error: any) {
    res.status(error.response?.status || 503).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update post'
    });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    await blogServiceClient.delete(`/${req.params.id}`, {
      headers: getUserHeaders(req)
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(error.response?.status || 503).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete post'
    });
  }
});

// Publish post
router.post('/posts/:id/publish', async (req, res) => {
  try {
    const response = await blogServiceClient.post(`/${req.params.id}/publish`, {}, {
      headers: getUserHeaders(req)
    });
    res.json(response.data.data.blog);
  } catch (error: any) {
    res.status(error.response?.status || 503).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to publish post'
    });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const response = await blogServiceClient.get('/categories/list');
    res.json(response.data.data.categories.map((c: any) => c._id));
  } catch (error: any) {
    // Fallback to default categories if service is unavailable
    res.json(['Travel Tips', 'Destination Guides', 'Volunteering', 'Culture & Heritage', 'Adventure Travel', 'Budget Travel', 'Food & Cuisine']);
  }
});

// Get tags
router.get('/tags', async (req, res) => {
  try {
    const response = await blogServiceClient.get('/tags/list');
    res.json(response.data.data.tags.map((t: any) => t._id));
  } catch (error: any) {
    // Fallback to default tags if service is unavailable
    res.json(['backpacking', 'solo-travel', 'family-travel', 'luxury', 'budget', 'photography', 'wildlife', 'beaches', 'mountains', 'cities']);
  }
});

export default router;
