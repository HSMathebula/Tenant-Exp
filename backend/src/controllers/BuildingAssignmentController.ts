import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { BuildingAssignment, AssignmentType } from '../models/BuildingAssignment';
import { User } from '../models/User';
import { Building } from '../models/Building';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../middleware/error.middleware';
import { NotificationType } from '../models/Notification';

export class BuildingAssignmentController {
  static async createAssignment(req: Request, res: Response) {
    try {
      const { userId, buildingId, type, startDate, endDate } = req.body;
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);
      const userRepository = AppDataSource.getRepository(User);
      const buildingRepository = AppDataSource.getRepository(Building);

      // Verify user exists
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Verify building exists
      const building = await buildingRepository.findOne({ where: { id: buildingId } });
      if (!building) {
        throw new AppError(404, 'Building not found');
      }

      // Check if assignment already exists
      const existingAssignment = await buildingAssignmentRepository.findOne({
        where: { user: { id: userId }, building: { id: buildingId }, isActive: true },
      });

      if (existingAssignment) {
        throw new AppError(400, 'User already has an active assignment for this building');
      }

      const assignment = buildingAssignmentRepository.create({
        user: { id: userId },
        building: { id: buildingId },
        type,
        startDate,
        endDate,
        isActive: true
      });

      await buildingAssignmentRepository.save(assignment);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error creating building assignment' });
      }
    }
  }

  static async getUserAssignments(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      const assignments = await buildingAssignmentRepository.find({
        where: { user: { id: userId } },
        relations: ['building', 'user'],
        order: { startDate: 'DESC' }
      });

      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user assignments' });
    }
  }

  static async getBuildingAssignments(req: Request, res: Response) {
    try {
      const { buildingId } = req.params;
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      const assignments = await buildingAssignmentRepository.find({
        where: { building: { id: buildingId } },
        relations: ['user', 'building'],
        order: { startDate: 'DESC' }
      });

      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching building assignments' });
    }
  }

  static async updateAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, startDate, endDate, isActive } = req.body;
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      const assignment = await buildingAssignmentRepository.findOne({
        where: { id },
        relations: ['user', 'building']
      });

      if (!assignment) {
        throw new AppError(404, 'Assignment not found');
      }

      Object.assign(assignment, {
        type,
        startDate,
        endDate,
        isActive
      });

      await buildingAssignmentRepository.save(assignment);
      res.json(assignment);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error updating building assignment' });
      }
    }
  }

  static async deleteAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      const assignment = await buildingAssignmentRepository.findOne({
        where: { id },
        relations: ['user', 'building']
      });

      if (!assignment) {
        throw new AppError(404, 'Assignment not found');
      }

      await buildingAssignmentRepository.remove(assignment);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error deleting building assignment' });
      }
    }
  }

  static async deregisterTenant(req: Request, res: Response) {
    try {
      const { userId, buildingId } = req.body;
      const assignmentRepository = AppDataSource.getRepository(BuildingAssignment);
      const userRepository = AppDataSource.getRepository(User);
      const buildingRepository = AppDataSource.getRepository(Building);

      // Verify user exists
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify building exists
      const building = await buildingRepository.findOne({ where: { id: buildingId } });
      if (!building) {
        return res.status(404).json({ message: 'Building not found' });
      }

      // Find active assignment
      const assignment = await assignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: buildingId },
          type: AssignmentType.TENANT,
          isActive: true
        }
      });

      if (!assignment) {
        return res.status(404).json({ message: 'No active tenant assignment found' });
      }

      // Update assignment
      assignment.isActive = false;
      assignment.endDate = new Date();
      await assignmentRepository.save(assignment);

      // Notify tenant
      await NotificationService.createNotification(
        userId,
        'Tenant Deregistration',
        `You have been deregistered from ${building.name}`,
        NotificationType.TENANT_DEREGISTRATION,
        undefined,
        buildingId
      );

      return res.json({
        message: 'Tenant deregistered successfully',
        assignment
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error deregistering tenant', error });
    }
  }
} 