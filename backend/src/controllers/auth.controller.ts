import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { User, UserRole } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

const excludePassword = (user: User) => {
  const userData = { ...user } as Partial<User>;
  delete userData.password;
  return userData;
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await userRepository.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: UserRole.TENANT
    });

    await userRepository.save(user);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: excludePassword(user), token });
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

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.json({ user: excludePassword(user), token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(excludePassword(user));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
}; 