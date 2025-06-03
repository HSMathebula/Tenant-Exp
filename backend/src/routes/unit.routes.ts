import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePropertyManager } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Property manager routes
router.post('/', requirePropertyManager, UnitController.create);
router.get('/', UnitController.getAll);
router.get('/:id', UnitController.getById);
router.put('/:id', requirePropertyManager, UnitController.update);
router.delete('/:id', requirePropertyManager, UnitController.delete);

// Unit management routes
router.post('/:id/assign-tenant', requirePropertyManager, UnitController.assignTenant);
router.post('/:id/remove-tenant', requirePropertyManager, UnitController.removeTenant);

// Unit-specific routes
router.get('/:id/maintenance-requests', UnitController.getMaintenanceRequests);
router.get('/:id/payments', UnitController.getPayments);

export default router; 