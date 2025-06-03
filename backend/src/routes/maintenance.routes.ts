import { Router } from 'express';
import { MaintenanceRequestController } from '../controllers/MaintenanceRequestController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/', authMiddleware, MaintenanceRequestController.create);

// Protected routes
router.get('/', authMiddleware, MaintenanceRequestController.getAll);
router.get('/:id', authMiddleware, MaintenanceRequestController.getById);
router.put('/:id', authMiddleware, MaintenanceRequestController.update);
router.delete('/:id', authMiddleware, MaintenanceRequestController.delete);

// Staff routes
router.get('/staff/assigned', authMiddleware, requireRole([UserRole.BUILDING_STAFF]), MaintenanceRequestController.getAssignedRequests);
router.put('/:id/status', authMiddleware, requireRole([UserRole.BUILDING_STAFF, UserRole.PROPERTY_MANAGER]), MaintenanceRequestController.updateStatus);
router.put('/:id/assign', authMiddleware, requireRole([UserRole.PROPERTY_MANAGER]), MaintenanceRequestController.assignRequest);

export default router; 