import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { Building } from '../models/Building';
import { BuildingAssignment, AssignmentType } from '../models/BuildingAssignment';
import { AppError } from '../middleware/error.middleware';
import { NotificationService } from './notification.service';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  required: boolean;
}

export interface OnboardingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  propertyInfo: {
    propertyId: string;
    unitNumber: string;
    moveInDate: Date;
    leaseStartDate: Date;
    leaseEndDate: Date;
  };
  documents: {
    idVerification: string;
    proofOfIncome: string;
    leaseAgreement: string;
    insuranceDocument: string;
  };
  preferences: {
    preferredContactMethod: string;
    preferredLanguage: string;
    notificationPreferences: {
      maintenance: boolean;
      announcements: boolean;
      payments: boolean;
      events: boolean;
    };
  };
  amenities: {
    parking: boolean;
    storage: boolean;
    pets: boolean;
    additionalServices: string[];
  };
}

export class TenantOnboardingService {
  static async initializeOnboarding(userId: string, buildingId: string): Promise<OnboardingStep[]> {
    const userRepository = AppDataSource.getRepository(User);
    const buildingRepository = AppDataSource.getRepository(Building);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Verify building exists
    const building = await buildingRepository.findOne({ where: { id: buildingId } });
    if (!building) {
      throw new AppError(404, 'Building not found');
    }

    // Create building assignment
    const assignment = buildingAssignmentRepository.create({
      user: { id: userId },
      building: { id: buildingId },
      isActive: true,
      type: AssignmentType.TENANT,
      startDate: new Date()
    });
    await buildingAssignmentRepository.save(assignment);

    // Initialize onboarding steps
    const steps: OnboardingStep[] = [
      {
        id: 'personal-info',
        title: 'Personal Information',
        description: 'Complete your personal details and emergency contact information',
        isCompleted: false,
        required: true
      },
      {
        id: 'property-info',
        title: 'Property Details',
        description: 'Confirm your unit number and lease information',
        isCompleted: false,
        required: true
      },
      {
        id: 'documents',
        title: 'Required Documents',
        description: 'Upload necessary documents for verification',
        isCompleted: false,
        required: true
      },
      {
        id: 'preferences',
        title: 'Communication Preferences',
        description: 'Set your preferred contact methods and notification settings',
        isCompleted: false,
        required: true
      },
      {
        id: 'amenities',
        title: 'Amenities & Services',
        description: 'Select additional services and amenities',
        isCompleted: false,
        required: false
      }
    ];

    // Store steps in user's metadata
    const user = await userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.metadata = {
        ...user.metadata,
        onboardingSteps: steps,
        onboardingStatus: 'IN_PROGRESS'
      };
      await userRepository.save(user);
    }

    // Send welcome notification
    await NotificationService.createNotification(
      userId,
      'Welcome to Your New Home!',
      'Let\'s get you settled in. Complete your onboarding process to access all features.',
      'ONBOARDING',
      undefined,
      buildingId
    );

    return steps;
  }

  static async updateOnboardingStep(
    userId: string,
    stepId: string,
    data: Partial<OnboardingData>
  ): Promise<OnboardingStep[]> {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const steps = user.metadata?.onboardingSteps || [];
    const stepIndex = steps.findIndex(step => step.id === stepId);

    if (stepIndex === -1) {
      throw new AppError(404, 'Onboarding step not found');
    }

    // Update step data based on stepId
    switch (stepId) {
      case 'personal-info':
        user.metadata = {
          ...user.metadata,
          personalInfo: data.personalInfo
        };
        break;
      case 'property-info':
        user.metadata = {
          ...user.metadata,
          propertyInfo: data.propertyInfo
        };
        break;
      case 'documents':
        user.metadata = {
          ...user.metadata,
          documents: data.documents
        };
        break;
      case 'preferences':
        user.metadata = {
          ...user.metadata,
          preferences: data.preferences
        };
        break;
      case 'amenities':
        user.metadata = {
          ...user.metadata,
          amenities: data.amenities
        };
        break;
    }

    // Mark step as completed
    steps[stepIndex].isCompleted = true;

    // Check if all required steps are completed
    const allRequiredCompleted = steps
      .filter(step => step.required)
      .every(step => step.isCompleted);

    if (allRequiredCompleted) {
      user.metadata.onboardingStatus = 'COMPLETED';
      // Send completion notification
      await NotificationService.createNotification(
        userId,
        'Onboarding Complete!',
        'Welcome to your new home! You now have full access to all features.',
        'ONBOARDING_COMPLETE',
        undefined,
        user.metadata.propertyInfo?.propertyId
      );
    }

    user.metadata.onboardingSteps = steps;
    await userRepository.save(user);

    return steps;
  }

  static async getOnboardingStatus(userId: string): Promise<{
    steps: OnboardingStep[];
    status: string;
    data: Partial<OnboardingData>;
  }> {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      steps: user.metadata?.onboardingSteps || [],
      status: user.metadata?.onboardingStatus || 'NOT_STARTED',
      data: {
        personalInfo: user.metadata?.personalInfo,
        propertyInfo: user.metadata?.propertyInfo,
        documents: user.metadata?.documents,
        preferences: user.metadata?.preferences,
        amenities: user.metadata?.amenities
      }
    };
  }
} 