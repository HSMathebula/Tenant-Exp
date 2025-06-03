import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/upload', authMiddleware, DocumentController.upload);

// Protected routes
router.get('/', authMiddleware, DocumentController.getAll);
router.get('/:id', authMiddleware, DocumentController.getById);
router.delete('/:id', authMiddleware, DocumentController.delete);

// Admin routes
router.get('/admin/all', authMiddleware, requireRole([UserRole.ADMIN]), DocumentController.getAllDocuments);

export default router; 