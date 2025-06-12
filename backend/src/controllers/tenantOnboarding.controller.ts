import { Request, Response } from 'express';
import { TenantOnboardingService } from '../services/tenantOnboarding.service';
import { AppError } from '../middleware/error.middleware';

export class TenantOnboardingController {
  static async startOnboarding(req: Request, res: Response) {
    try {
      const { propertyId } = req.body;
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      const steps = await TenantOnboardingService.initializeOnboarding(userId, propertyId);
      res.json({ steps });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async updateStep(req: Request, res: Response) {
    try {
      const { stepId, data } = req.body;
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      const steps = await TenantOnboardingService.updateOnboardingStep(userId, stepId, data);
      res.json({ steps });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      const status = await TenantOnboardingService.getOnboardingStatus(userId);
      res.json(status);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 