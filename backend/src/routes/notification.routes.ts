import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/', authMiddleware, NotificationController.create);

// Protected routes
router.get('/', authMiddleware, NotificationController.getAll);
router.get('/:id', authMiddleware, NotificationController.getById);
router.put('/:id', authMiddleware, NotificationController.update);
router.delete('/:id', authMiddleware, NotificationController.delete);

// Admin routes
router.get('/admin/all', authMiddleware, requireRole([UserRole.ADMIN]), NotificationController.getAllNotifications);

export default router; 