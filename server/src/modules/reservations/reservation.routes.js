import { Router } from 'express';
import {
  createReservation,
  getMyReservations,
  getReservations,
  updateReservationStatus,
  deleteReservation,
  getVacantTables,
  assignStaffToReservation,
} from './reservation.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

// Gated routes
router.use(protect);

router.post('/', createReservation);
router.get('/my', getMyReservations);
router.get('/vacant-tables', getVacantTables);

// Admin-facing routes
router.get('/', authorize('admin', 'manager', 'staff'), getReservations);
router.put('/:id/status', authorize('admin', 'manager', 'staff'), updateReservationStatus);
router.delete('/:id', authorize('admin', 'manager'), deleteReservation);
router.put('/:id/assign', authorize('admin', 'manager'), assignStaffToReservation);

export default router;
