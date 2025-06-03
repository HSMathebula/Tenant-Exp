import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.get('/public', EventController.getPublicEvents);

// Protected routes
router.post('/', authMiddleware, requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]), EventController.create);
router.get('/', authMiddleware, EventController.getAll);
router.get('/:id', authMiddleware, EventController.getById);
router.put('/:id', authMiddleware, requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]), EventController.update);
router.delete('/:id', authMiddleware, requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]), EventController.delete);

// Event registration routes
router.post('/:id/register', EventController.registerAttendee);
router.delete('/:id/unregister', EventController.unregisterAttendee);

export default router; 