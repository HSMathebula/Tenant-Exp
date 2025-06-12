import { Router } from 'express';
import { BuildingAssignmentController } from '../controllers/BuildingAssignmentController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Assign user to building (property manager only)
router.post(
  '/assign',
  authMiddleware,
  requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]),
  BuildingAssignmentController.assignUserToBuilding
);

// Deregister tenant from building (property manager only)
router.post(
  '/deregister',
  authMiddleware,
  requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]),
  BuildingAssignmentController.deregisterTenant
);

// Get user's building assignments
router.get(
  '/user/:userId',
  authMiddleware,
  BuildingAssignmentController.getUserAssignments
);

// Get all assignments for a building
router.get(
  '/building/:propertyId',
  authMiddleware,
  requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]),
  BuildingAssignmentController.getBuildingAssignments
);

// Update building assignment
router.patch(
  '/:id',
  authMiddleware,
  requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]),
  BuildingAssignmentController.updateAssignment
);

export default router; 