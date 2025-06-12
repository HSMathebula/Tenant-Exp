import { Router } from 'express';
import { AmenityBookingController } from '../controllers/AmenityBookingController';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Create a new booking
router.post('/', requireAuth, requireRole([UserRole.TENANT]), AmenityBookingController.create);

// Get all bookings
router.get('/', requireAuth, AmenityBookingController.getAll);

// Get booking by ID
router.get('/:id', requireAuth, AmenityBookingController.getById);

// Update booking status
router.patch('/:id/status', requireAuth, requireRole([UserRole.PROPERTY_MANAGER, UserRole.BUILDING_STAFF]), AmenityBookingController.updateStatus);

// Cancel booking
router.post('/:id/cancel', requireAuth, requireRole([UserRole.TENANT]), AmenityBookingController.cancel);

export default router; 