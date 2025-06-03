import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/', authMiddleware, PaymentController.create);

// Protected routes
router.get('/', authMiddleware, PaymentController.getAll);
router.get('/:id', authMiddleware, PaymentController.getById);
router.put('/:id', authMiddleware, PaymentController.update);
router.delete('/:id', authMiddleware, PaymentController.delete);

// Admin routes
router.get('/admin/all', authMiddleware, requireRole([UserRole.ADMIN]), PaymentController.getAllPayments);
router.put('/:id/status', authMiddleware, requireRole([UserRole.ADMIN, UserRole.PROPERTY_MANAGER]), PaymentController.updateStatus);

export default router; 