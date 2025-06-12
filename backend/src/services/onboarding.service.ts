import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { OnboardingStep, OnboardingStepStatus } from '../models/onboarding-step';
import { Document, DocumentType, DocumentStatus } from '../models/Document';
import { UserPreference } from '../models/UserPreference';
import { StorageService } from './storage.service';

type StepData = {
  [key: string]: string | number | boolean | null;
};

export class OnboardingService {
  static async getOnboardingStatus(userId: string) {
    const userRepository = AppDataSource.getRepository(User);
    const stepRepository = AppDataSource.getRepository(OnboardingStep);
    const documentRepository = AppDataSource.getRepository(Document);
    const preferenceRepository = AppDataSource.getRepository(UserPreference);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const steps = await stepRepository.find({ where: { userId } });
    const documents = await documentRepository.find({ where: { userId } });
    const preferences = await preferenceRepository.findOne({ where: { userId } });

    return {
      completed: user.onboardingCompleted,
      steps: steps.map(step => ({
        id: step.id,
        type: step.type,
        status: step.status,
        data: step.data,
        completedAt: step.completedAt
      })),
      documents: documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        status: doc.status,
        url: doc.url,
        verifiedAt: doc.verifiedAt
      })),
      preferences: preferences || {}
    };
  }

  static async updateStep(userId: string, stepId: string, data: StepData) {
    const stepRepository = AppDataSource.getRepository(OnboardingStep);
    const step = await stepRepository.findOne({ where: { id: stepId, userId } });

    if (!step) {
      throw new Error('Step not found');
    }

    step.data = { ...step.data, ...data };
    step.status = OnboardingStepStatus.COMPLETED;
    step.completedAt = new Date();

    await stepRepository.save(step);
    return step;
  }

  static async saveDocument(userId: string, stepId: string, type: string, file: Express.Multer.File) {
    const documentRepository = AppDataSource.getRepository(Document);
    const stepRepository = AppDataSource.getRepository(OnboardingStep);

    const step = await stepRepository.findOne({ where: { id: stepId, userId } });
    if (!step) {
      throw new Error('Step not found');
    }

    // Upload file to storage
    const url = await StorageService.uploadFile(file, `documents/${userId}/${type}`);

    // Create document record
    const document = documentRepository.create({
      user: { id: userId },
      type: type as unknown as DocumentType,
      url,
      status: DocumentStatus.PENDING,
      step: { id: stepId }
    });

    await documentRepository.save(document);
    return url;
  }

  static async verifyDocument(userId: string, documentId: string) {
    const documentRepository = AppDataSource.getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId, userId } });

    if (!document) {
      throw new Error('Document not found');
    }

    document.status = DocumentStatus.VERIFIED;
    document.verifiedAt = new Date();

    await documentRepository.save(document);
    return true;
  }

  static async updatePreferences(userId: string, preferences: Partial<UserPreference>) {
    const preferenceRepository = AppDataSource.getRepository(UserPreference);
    let userPreferences = await preferenceRepository.findOne({ where: { userId } });

    if (!userPreferences) {
      userPreferences = preferenceRepository.create({
        userId,
        user: { id: userId },
        notificationPreferences: {},
        amenityPreferences: {},
        communicationPreferences: {},
        ...preferences
      } as UserPreference);
    } else {
      Object.assign(userPreferences, preferences);
    }

    await preferenceRepository.save(userPreferences);
    return userPreferences;
  }

  static async completeOnboarding(userId: string) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();

    await userRepository.save(user);
    return true;
  }

  static async skipStep(userId: string, stepId: string) {
    const stepRepository = AppDataSource.getRepository(OnboardingStep);
    const step = await stepRepository.findOne({ where: { id: stepId, userId } });

    if (!step) {
      throw new Error('Step not found');
    }

    step.status = OnboardingStepStatus.SKIPPED;
    step.completedAt = new Date();

    await stepRepository.save(step);
    return true;
  }

  static async resetOnboarding(userId: string) {
    const userRepository = AppDataSource.getRepository(User);
    const stepRepository = AppDataSource.getRepository(OnboardingStep);
    const documentRepository = AppDataSource.getRepository(Document);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Reset user onboarding status
    user.onboardingCompleted = false;
    user.onboardingCompletedAt = null;
    await userRepository.save(user);

    // Delete all steps
    await stepRepository.delete({ userId });

    // Delete all documents
    const documents = await documentRepository.find({ where: { userId } });
    for (const doc of documents) {
      await StorageService.deleteFile(doc.url);
    }
    await documentRepository.delete({ userId });

    return true;
  }
} 