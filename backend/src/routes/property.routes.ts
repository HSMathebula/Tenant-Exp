import { Router } from 'express';
import { PropertyController } from '../controllers/PropertyController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePropertyManager } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Property manager routes
router.post('/', requirePropertyManager, PropertyController.create);
router.get('/', PropertyController.getAll);
router.get('/:id', PropertyController.getById);
router.put('/:id', requirePropertyManager, PropertyController.update);
router.delete('/:id', requirePropertyManager, PropertyController.delete);

// Property-specific routes
router.get('/:id/units', PropertyController.getUnits);
router.get('/:id/documents', PropertyController.getDocuments);
router.get('/:id/events', PropertyController.getEvents);

export default router; 