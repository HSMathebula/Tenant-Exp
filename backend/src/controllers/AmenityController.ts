import { Request, Response } from 'express';
import { AppError } from '../utils/appError';

export class AmenityController {
  static async getAvailableAmenities(req: Request, res: Response) {
    try {
      // Mock data for available amenities
      const availableAmenities = [
        { id: 1, name: 'Swimming Pool', available: true },
        { id: 2, name: 'Gym', available: true },
        { id: 3, name: 'Parking', available: false },
        { id: 4, name: 'Storage', available: true },
      ];
      res.json(availableAmenities);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 