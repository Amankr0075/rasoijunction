import { Router } from 'express';
import { getNotifications, markAllRead, deleteNotification, broadcastMessage } from './notification.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);
router.post('/broadcast', protect, authorize('admin', 'manager'), upload.single('attachment'), broadcastMessage);

export default router;
