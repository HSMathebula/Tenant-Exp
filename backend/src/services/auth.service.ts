import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '24h';

  static async generateToken(user: User): Promise<string> {
    return jwt.sign(
      { userId: user.id, role: user.role },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  static async verifyToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: string; role: string };
    } catch (error) {
      throw new AppError(401, 'Invalid token');
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async validateUser(email: string, password: string): Promise<User> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await this.comparePasswords(password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(401, 'Account is inactive');
    }

    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValidPassword = await this.comparePasswords(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Current password is incorrect');
    }

    user.password = await this.hashPassword(newPassword);
    await userRepository.save(user);
  }
} 