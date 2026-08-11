import { Router } from 'express';
import { getMaintenanceStatus, toggleMaintenanceMode } from './system.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

router.get('/maintenance/status', getMaintenanceStatus);
router.post('/maintenance/toggle', protect, authorize('admin', 'manager'), toggleMaintenanceMode);

export default router;
