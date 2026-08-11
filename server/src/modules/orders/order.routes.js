import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignStaff,
  cancelOrder,
  deleteOrder,
  deleteAllOrders,
} from './order.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

// Secure all order routes
router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Customer actions
router.put('/:id/cancel', authorize('customer'), cancelOrder);

// Staff tracking & workflow updates
router.put('/:id/status', updateOrderStatus);

// Admin staff routing overrides
router.put('/:id/assign', authorize('admin', 'manager'), assignStaff);
router.delete('/all', authorize('admin', 'manager'), deleteAllOrders);
router.delete('/:id', authorize('admin', 'manager'), deleteOrder);

export default router;
