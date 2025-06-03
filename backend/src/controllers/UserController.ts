import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { validate } from 'class-validator';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { email, password, firstName, lastName, role, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = new User();
      user.email = email;
      user.password = await hash(password, 10);
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = role || UserRole.TENANT;
      user.phoneNumber = phoneNumber;

      // Validate user
      const errors = await validate(user);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save user
      await userRepository.save(user);

      // Generate JWT
      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'User created successfully',
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
      return res.status(500).json({ message: 'Error creating user', error });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful',
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
      return res.status(500).json({ message: 'Error logging in', error });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = req.user?.userId;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          address: user.address,
          emergencyContact: user.emergencyContact,
          preferences: user.preferences
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching profile', error });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = req.user?.userId;
      const updates = req.body;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user fields
      Object.assign(user, updates);

      // Validate updates
      const errors = await validate(user);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await userRepository.save(user);

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          address: user.address,
          emergencyContact: user.emergencyContact,
          preferences: user.preferences
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating profile', error });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = await hash(newPassword, 10);
      await userRepository.save(user);

      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error changing password', error });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = req.user?.userId;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await userRepository.remove(user);

      return res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting account', error });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { email } = req.body;

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // TODO: Send reset email with token
      // For now, just return the token
      return res.json({
        message: 'Password reset instructions sent to your email',
        resetToken
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error processing password reset', error });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { token, newPassword } = req.body;

      // Verify token
      const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      const user = await userRepository.findOne({ where: { id: decoded.userId } });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update password
      user.password = await hash(newPassword, 10);
      await userRepository.save(user);

      return res.json({ message: 'Password reset successful' });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'phoneNumber', 'createdAt']
      });
      return res.json({ users });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ user });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      Object.assign(user, req.body);
      await userRepository.save(user);
      return res.json({ message: 'User updated successfully', user });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating user', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await userRepository.remove(user);
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting user', error });
    }
  }

  static async getTenants(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const tenants = await userRepository.find({
        where: { role: UserRole.TENANT },
        select: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'createdAt']
      });
      return res.json({ tenants });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching tenants', error });
    }
  }

  static async getStaff(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const staff = await userRepository.find({
        where: { role: UserRole.BUILDING_STAFF },
        select: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'createdAt']
      });
      return res.json({ staff });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching staff', error });
    }
  }
} 