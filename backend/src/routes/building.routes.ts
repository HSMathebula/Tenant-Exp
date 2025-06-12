import { Router } from 'express';
import { BuildingController } from '../controllers/BuildingController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();
const buildingController = new BuildingController();

// Public routes
router.get('/', buildingController.getAll);
router.get('/:id', buildingController.getOne);
router.get('/:id/stats', buildingController.getStats);

// Admin only routes
router.post(
  '/',
  authMiddleware,
  requireRole([UserRole.ADMIN]),
  buildingController.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole([UserRole.ADMIN]),
  buildingController.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole([UserRole.ADMIN]),
  buildingController.delete
);

export default router; 