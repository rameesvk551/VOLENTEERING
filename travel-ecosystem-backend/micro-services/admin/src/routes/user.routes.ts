import { Router } from 'express';
import { User } from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = req.query.search as string;

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    res.json({
      items: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
