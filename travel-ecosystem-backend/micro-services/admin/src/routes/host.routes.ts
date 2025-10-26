import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

const mockHosts = [
  {
    id: '1',
    name: 'John Adventure',
    email: 'john@adventure.com',
    phone: '+1234567890',
    location: 'Colorado, USA',
    rating: 4.8,
    totalTrips: 24,
    verified: true,
    status: 'active',
    createdAt: new Date(),
  },
];

router.get('/', async (req, res) => {
  res.json({
    items: mockHosts,
    total: mockHosts.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
});

router.put('/:id', async (req, res) => {
  const host = mockHosts.find((h: any) => h.id === req.params.id);
  if (host) {
    Object.assign(host, req.body);
    res.json(host);
  } else {
    res.status(404).json({ message: 'Host not found' });
  }
});

router.post('/:id/verify', async (req, res) => {
  const host = mockHosts.find((h: any) => h.id === req.params.id);
  if (host) {
    host.verified = true;
    res.json(host);
  } else {
    res.status(404).json({ message: 'Host not found' });
  }
});

export default router;
