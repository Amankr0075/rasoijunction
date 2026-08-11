import { Router } from 'express';
import { createContact, getContacts, deleteContact, replyContact, getMyContacts } from './contact.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';

const router = Router();

router.post('/', createContact);
router.get('/mine', protect, getMyContacts);
router.get('/', protect, authorize('admin', 'manager'), getContacts);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteContact);
router.put('/:id/reply', protect, authorize('admin', 'manager'), replyContact);

export default router;
