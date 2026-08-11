import { Router } from 'express';
import { getReviews, createReview, deleteReview } from './review.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

router.get('/', getReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteReview);

export default router;
