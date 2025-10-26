import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', async (req, res) => {
  res.json({
    metrics: [
      { label: 'Total Users', value: 12543, change: 12.5, trend: 'up' },
      { label: 'Active Trips', value: 342, change: 8.2, trend: 'up' },
      { label: 'Revenue', value: 48392, change: 23.1, trend: 'up' },
      { label: 'Bookings', value: 1284, change: -3.2, trend: 'down' },
    ],
  });
});

router.get('/charts/:type', async (req, res) => {
  res.json([
    { month: 'Jan', value: 4000 },
    { month: 'Feb', value: 3000 },
    { month: 'Mar', value: 5000 },
    { month: 'Apr', value: 4500 },
    { month: 'May', value: 6000 },
    { month: 'Jun', value: 5500 },
  ]);
});

export default router;
