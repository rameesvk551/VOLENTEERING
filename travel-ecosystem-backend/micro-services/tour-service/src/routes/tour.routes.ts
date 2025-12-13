import { Router } from 'express';
import { TourController } from '../controllers/tour.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();
const tourController = new TourController();

/**
 * Tour Routes
 */

// Search tours
router.get('/search', tourController.search);

// Get tour details
router.get('/:provider/:productId', tourController.getDetails);

// Generate redirect URL for booking
router.post('/redirect', tourController.generateRedirect);

// Track conversion (callback from provider)
router.post('/conversion', tourController.trackConversion);

// Health check
router.get('/health', tourController.getHealth);

// Clear cache (admin only)
router.post('/cache/clear', requireAdmin, tourController.clearCache);

export default router;
