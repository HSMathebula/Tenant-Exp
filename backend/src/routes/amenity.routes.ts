import { Router } from 'express';
import { AmenityController } from '../controllers/AmenityController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/available', authMiddleware, AmenityController.getAvailableAmenities);

export default router; 