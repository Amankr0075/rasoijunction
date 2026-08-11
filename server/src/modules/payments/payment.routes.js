import { Router } from 'express';
import {
  processSimulatedPayment,
  getPaymentByOrderId,
  getAllPayments,
} from './payment.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

// Gated routes
router.use(protect);

router.post('/process-simulated', processSimulatedPayment);
router.get('/order/:orderId', getPaymentByOrderId);

// Admin billing overview logs
router.get('/', authorize('admin', 'manager'), getAllPayments);

export default router;
