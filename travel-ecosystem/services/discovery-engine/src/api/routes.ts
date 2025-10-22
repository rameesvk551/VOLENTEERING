import express from 'express';

const router = express.Router();

router.get('/discover', (_req, res) => {
  res.json({ message: 'discovery chain not implemented yet' });
});

export default router;
