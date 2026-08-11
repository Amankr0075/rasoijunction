import { Router } from 'express';
import {
  getFeedbacks,
  getMyFeedbacks,
  createFeedback,
  replyFeedback,
  deleteFeedback,
} from './feedback.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

// Customer feedback submit and history
router.post('/', protect, createFeedback);
router.get('/mine', protect, getMyFeedbacks);

// Admin feedback view and actions
router.get('/', protect, authorize('admin', 'manager'), getFeedbacks);
router.put('/:id/reply', protect, authorize('admin', 'manager'), replyFeedback);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteFeedback);

export default router;
