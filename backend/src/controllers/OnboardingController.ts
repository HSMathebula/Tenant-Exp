import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { OnboardingService } from '../services/onboarding.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

export class OnboardingController {
  static async getStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const status = await OnboardingService.getOnboardingStatus(userId);
      return res.json(status);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching onboarding status', error });
    }
  }

  static async updateStep(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { stepId } = req.params;
      const data = req.body;

      await OnboardingService.updateStep(userId, stepId, data);
      return res.json({ message: 'Step updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating step', error });
    }
  }

  static async uploadDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { stepId } = req.params;
      const { type } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const documentUrl = await OnboardingService.saveDocument(userId, stepId, type, file);
      return res.json({ documentUrl });
    } catch (error) {
      return res.status(500).json({ message: 'Error uploading document', error });
    }
  }

  static async verifyDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { documentId } = req.params;
      const verified = await OnboardingService.verifyDocument(userId, documentId);
      return res.json({ verified });
    } catch (error) {
      return res.status(500).json({ message: 'Error verifying document', error });
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const preferences = req.body;
      await OnboardingService.updatePreferences(userId, preferences);
      return res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating preferences', error });
    }
  }

  static async completeOnboarding(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await OnboardingService.completeOnboarding(userId);

      // Send welcome email
      const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });
      if (user?.email) {
        await EmailService.sendWelcomeEmail(user.email, user.firstName);
      }

      // Create welcome notification
      await NotificationService.createNotification(
        userId,
        'Welcome to Your New Home!',
        'Your onboarding process is complete. Start exploring your new home!',
        'system'
      );

      return res.json({ message: 'Onboarding completed successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error completing onboarding', error });
    }
  }

  static async skipStep(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { stepId } = req.params;
      await OnboardingService.skipStep(userId, stepId);
      return res.json({ message: 'Step skipped successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error skipping step', error });
    }
  }

  static async resetOnboarding(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await OnboardingService.resetOnboarding(userId);
      return res.json({ message: 'Onboarding reset successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error resetting onboarding', error });
    }
  }
} 