import { Router } from 'express';
import {
  getCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from './coupon.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

// Public routes for validation and fetching
router.get('/', getCoupons);
router.get('/:code', getCouponByCode);

// Protected Admin/Manager routes for management
router.post('/', protect, authorize('admin', 'manager'), createCoupon);
router.put('/:id', protect, authorize('admin', 'manager'), updateCoupon);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteCoupon);

export default router;
