import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Get onboarding status
router.get('/status', authMiddleware, OnboardingController.getStatus);

// Update onboarding step
router.put('/steps/:stepId', authMiddleware, OnboardingController.updateStep);

// Upload document
router.post(
  '/steps/:stepId/documents',
  authMiddleware,
  upload.single('file'),
  OnboardingController.uploadDocument
);

// Verify document
router.put(
  '/documents/:documentId/verify',
  authMiddleware,
  OnboardingController.verifyDocument
);

// Update preferences
router.put('/preferences', authMiddleware, OnboardingController.updatePreferences);

// Complete onboarding
router.post('/complete', authMiddleware, OnboardingController.completeOnboarding);

// Skip step
router.post('/steps/:stepId/skip', authMiddleware, OnboardingController.skipStep);

// Reset onboarding
router.post('/reset', authMiddleware, OnboardingController.resetOnboarding);

export default router; 