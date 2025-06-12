import { Router } from 'express';
import { EventRegistrationController } from '../controllers/EventRegistrationController';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Create a new registration
router.post('/', requireAuth, requireRole([UserRole.TENANT]), EventRegistrationController.create);

// Get all registrations
router.get('/', requireAuth, EventRegistrationController.getAll);

// Get registration by ID
router.get('/:id', requireAuth, EventRegistrationController.getById);

// Update registration status
router.patch('/:id/status', requireAuth, requireRole([UserRole.PROPERTY_MANAGER, UserRole.BUILDING_STAFF]), EventRegistrationController.updateStatus);

// Cancel registration
router.post('/:id/cancel', requireAuth, requireRole([UserRole.TENANT]), EventRegistrationController.cancel);

export default router; 