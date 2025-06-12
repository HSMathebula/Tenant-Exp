import { Router } from 'express';
import { PackageController } from '../controllers/PackageController';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Create a new package
router.post('/', requireAuth, requireRole([UserRole.PROPERTY_MANAGER, UserRole.BUILDING_STAFF]), PackageController.create);

// Get all packages
router.get('/', requireAuth, PackageController.getAll);

// Get package by ID
router.get('/:id', requireAuth, PackageController.getById);

// Update package status
router.patch('/:id/status', requireAuth, requireRole([UserRole.PROPERTY_MANAGER, UserRole.BUILDING_STAFF]), PackageController.updateStatus);

// Delete package
router.delete('/:id', requireAuth, requireRole([UserRole.PROPERTY_MANAGER, UserRole.BUILDING_STAFF]), PackageController.delete);

export default router; 