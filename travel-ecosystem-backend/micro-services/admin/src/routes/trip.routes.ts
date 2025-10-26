import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

// Mock data - replace with actual database queries
const mockTrips = [
  {
    id: '1',
    title: 'Himalayan Adventure',
    destination: 'Nepal',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    maxParticipants: 15,
    currentParticipants: 8,
    price: 1500,
    status: 'published',
    hostId: 'h1',
    hostName: 'Adventure Co.',
    createdAt: new Date(),
  },
];

router.get('/', async (req, res) => {
  res.json({
    items: mockTrips,
    total: mockTrips.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
});

router.post('/', async (req, res) => {
  const newTrip = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
  mockTrips.push(newTrip);
  res.status(201).json(newTrip);
});

router.put('/:id', async (req, res) => {
  const trip = mockTrips.find((t: any) => t.id === req.params.id);
  if (trip) {
    Object.assign(trip, req.body);
    res.json(trip);
  } else {
    res.status(404).json({ message: 'Trip not found' });
  }
});

router.delete('/:id', async (req, res) => {
  res.status(204).send();
});

export default router;
