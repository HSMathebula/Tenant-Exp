import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole([UserRole.ADMIN]));

// Report routes
router.get('/revenue', ReportController.getRevenueReport);
router.get('/occupancy', ReportController.getOccupancyReport);
router.get('/maintenance', ReportController.getMaintenanceReport);

export default router; 