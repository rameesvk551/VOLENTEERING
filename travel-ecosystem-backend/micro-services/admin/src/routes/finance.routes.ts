import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

const mockRecords = [
  {
    id: '1',
    type: 'income',
    category: 'Trip Booking',
    amount: 1500,
    description: 'Himalayan Adventure booking',
    date: new Date(),
    createdAt: new Date(),
  },
  {
    id: '2',
    type: 'expense',
    category: 'Equipment',
    amount: 500,
    description: 'New camping gear',
    date: new Date(),
    createdAt: new Date(),
  },
];

router.get('/records', async (req, res) => {
  res.json({
    items: mockRecords,
    total: mockRecords.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
});

router.get('/summary', async (req, res) => {
  const totalIncome = mockRecords
    .filter((r: any) => r.type === 'income')
    .reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalExpense = mockRecords
    .filter((r: any) => r.type === 'expense')
    .reduce((sum: number, r: any) => sum + r.amount, 0);

  res.json({
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
  });
});

export default router;
