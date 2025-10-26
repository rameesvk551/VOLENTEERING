import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

const mockGear = [
  {
    id: '1',
    name: 'Mountain Tent',
    category: 'Camping',
    description: '4-person waterproof tent',
    pricePerDay: 25,
    available: 5,
    total: 10,
    condition: 'excellent',
    images: [],
    createdAt: new Date(),
  },
];

router.get('/', async (req, res) => {
  res.json({
    items: mockGear,
    total: mockGear.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
});

router.post('/', async (req, res) => {
  const newGear = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
  mockGear.push(newGear);
  res.status(201).json(newGear);
});

router.put('/:id', async (req, res) => {
  const gear = mockGear.find((g: any) => g.id === req.params.id);
  if (gear) {
    Object.assign(gear, req.body);
    res.json(gear);
  } else {
    res.status(404).json({ message: 'Gear not found' });
  }
});

router.delete('/:id', async (req, res) => {
  res.status(204).send();
});

export default router;
