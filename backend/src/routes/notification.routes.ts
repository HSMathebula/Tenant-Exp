import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes
router.post('/', authMiddleware, NotificationController.create);

// Protected routes
router.get('/', authMiddleware, NotificationController.getAll);
router.get('/:id', authMiddleware, NotificationController.getById);
router.put('/:id', authMiddleware, NotificationController.update);
router.delete('/:id', authMiddleware, NotificationController.delete);
router.get('/preferences', authMiddleware, NotificationController.getNotificationPreferences);

// Admin routes
router.get('/admin/all', authMiddleware, requireRole([UserRole.ADMIN]), NotificationController.getAllNotifications);

// Get user's notifications
router.get('/my-notifications', NotificationController.getMyNotifications);

// Mark notification as read
router.put('/notifications/:id/read', NotificationController.markAsRead);

export default router; 