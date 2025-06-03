import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Admin routes
router.get('/', requireRole([UserRole.ADMIN]), UserController.getAll);
router.get('/:id', requireRole([UserRole.ADMIN]), UserController.getById);
router.put('/:id', requireRole([UserRole.ADMIN]), UserController.update);
router.delete('/:id', requireRole([UserRole.ADMIN]), UserController.delete);

// Property manager routes
router.get('/tenants', requireRole([UserRole.PROPERTY_MANAGER]), UserController.getTenants);
router.get('/staff', requireRole([UserRole.PROPERTY_MANAGER]), UserController.getStaff);

export default router; 