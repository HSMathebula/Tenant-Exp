import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import { Building } from '../models/Building';
import { BuildingAssignment, AssignmentType } from '../models/BuildingAssignment';
import { TenantOnboardingService } from '../services/tenantOnboarding.service';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
  };
}

const userRepository = AppDataSource.getRepository(User);

const excludePassword = (user: User) => {
  const userData = { ...user } as Partial<User>;
  delete userData.password;
  return userData;
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, buildingId } = req.body;
    const buildingRepository = AppDataSource.getRepository(Building);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify building exists if provided
    if (buildingId) {
      const building = await buildingRepository.findOne({ where: { id: buildingId } });
      if (!building) {
        return res.status(404).json({ message: 'Building not found' });
      }
    }

    // Create user
    const hashedPassword = await hash(password, 10);
    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: UserRole.TENANT
    });

    await userRepository.save(user);

    // If buildingId is provided, create building assignment and start onboarding
    if (buildingId) {
      // Create building assignment
      const assignment = buildingAssignmentRepository.create({
        user: { id: user.id },
        building: { id: buildingId },
        type: AssignmentType.TENANT,
        startDate: new Date(),
        isActive: true
      });
      await buildingAssignmentRepository.save(assignment);

      // Initialize onboarding
      await TenantOnboardingService.initializeOnboarding(user.id, buildingId);
    }

    // Generate JWT
    const token = sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.json({ user: excludePassword(user), token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(excludePassword(user));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
}; 