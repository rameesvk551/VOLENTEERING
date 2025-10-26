import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

const mockBookings = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Jane Doe',
    tripId: 't1',
    tripTitle: 'Himalayan Adventure',
    bookingType: 'trip',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    totalAmount: 1500,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date(),
  },
];

router.get('/', async (req, res) => {
  res.json({
    items: mockBookings,
    total: mockBookings.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
});

router.put('/:id/status', async (req, res) => {
  const booking = mockBookings.find((b: any) => b.id === req.params.id);
  if (booking) {
    booking.status = req.body.status;
    res.json(booking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
});

export default router;
