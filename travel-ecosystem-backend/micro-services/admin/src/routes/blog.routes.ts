import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

const mockPosts = [
  {
    id: '1',
    title: 'Top 10 Hiking Trails',
    slug: 'top-10-hiking-trails',
    excerpt: 'Discover the best hiking trails around the world',
    content: 'Full content here...',
    authorId: 'a1',
    authorName: 'Admin User',
    categories: ['Travel', 'Adventure'],
    tags: ['hiking', 'trails', 'nature'],
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

router.get('/posts', async (req, res) => {
  res.json({
    items: mockPosts,
    total: mockPosts.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
});

router.get('/posts/:id', async (req, res) => {
  const post = mockPosts.find((p: any) => p.id === req.params.id);
  res.json(post || null);
});

router.post('/posts', async (req, res) => {
  const newPost = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockPosts.push(newPost);
  res.status(201).json(newPost);
});

router.put('/posts/:id', async (req, res) => {
  const post = mockPosts.find((p: any) => p.id === req.params.id);
  if (post) {
    Object.assign(post, req.body, { updatedAt: new Date() });
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

router.delete('/posts/:id', async (req, res) => {
  res.status(204).send();
});

router.post('/posts/:id/publish', async (req, res) => {
  const post = mockPosts.find((p: any) => p.id === req.params.id);
  if (post) {
    post.status = 'published';
    post.publishedAt = new Date();
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

router.get('/categories', async (req, res) => {
  res.json(['Travel', 'Adventure', 'Gear', 'Tips']);
});

router.get('/tags', async (req, res) => {
  res.json(['hiking', 'camping', 'trails', 'nature', 'adventure']);
});

export default router;
