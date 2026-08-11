import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from './menu.controller.js';
import { protect, optionalAuth } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

// Public / Option-Auth routes
router.get('/', optionalAuth, getMenuItems);
router.get('/:id', getMenuItemById);

// Protected Admin / Manager routes
router.post('/', protect, authorize('admin', 'manager'), createMenuItem);
router.put('/:id', protect, authorize('admin', 'manager', 'staff'), updateMenuItem);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteMenuItem);

export default router;
