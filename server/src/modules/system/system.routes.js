import { Router } from 'express';
import { getMaintenanceStatus, toggleMaintenanceMode, sendCustomEmail, getEmailLogs, generatePromotionalEmail } from './system.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

router.get('/maintenance/status', getMaintenanceStatus);
router.post('/maintenance/toggle', protect, authorize('admin', 'manager'), toggleMaintenanceMode);

// Admin Email Routes
router.post('/emails/send', protect, authorize('admin'), sendCustomEmail);
router.get('/emails/logs', protect, authorize('admin'), getEmailLogs);
router.post('/emails/generate', protect, authorize('admin'), generatePromotionalEmail);

export default router;
