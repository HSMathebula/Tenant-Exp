import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { CalendarEvent, EventStatus, EventType } from '../models/CalendarEvent';
import { User } from '../models/User';
import { validate } from 'class-validator';
import { Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { NotificationService } from '../services/NotificationService';
import { NotificationType } from '../models/Notification';

export class CalendarEventController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CalendarEvent);
      const userRepo = AppDataSource.getRepository(User);
      const { title, description, type, status, startTime, endTime, propertyId, unitId, assignedToId, metadata } = req.body;

      const assignedTo = await userRepo.findOne({ where: { id: assignedToId } });
      if (!assignedTo) return res.status(404).json({ message: 'Assigned user not found' });

      const event = repo.create({
        title,
        description,
        type,
        status: status || EventStatus.SCHEDULED,
        startTime,
        endTime,
        property: propertyId ? { id: propertyId } : undefined,
        unit: unitId ? { id: unitId } : undefined,
        assignedTo,
        createdBy: req.user?.userId ? { id: req.user.userId } : undefined,
        metadata
      });
      const errors = await validate(event);
      if (errors.length > 0) return res.status(400).json({ errors });
      await repo.save(event);

      // Create notification for assigned user
      await NotificationService.createEventNotification(
        NotificationType.EVENT_CREATED,
        event,
        assignedTo,
        `You have been assigned to a new event: ${event.title}`
      );

      return res.status(201).json({ event });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating event', error });
    }
  }

  static async getMyEvents(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CalendarEvent);
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const {
        startDate,
        endDate,
        status,
        type,
        propertyId,
        unitId
      } = req.query;

      const whereClause: FindOptionsWhere<CalendarEvent> = { assignedTo: { id: userId } };

      // Add date range filter
      if (startDate && endDate) {
        whereClause.startTime = Between(new Date(startDate as string), new Date(endDate as string));
      } else if (startDate) {
        whereClause.startTime = MoreThanOrEqual(new Date(startDate as string));
      } else if (endDate) {
        whereClause.startTime = LessThanOrEqual(new Date(endDate as string));
      }

      // Add status filter
      if (status) {
        whereClause.status = status as EventStatus;
      }

      // Add type filter
      if (type) {
        whereClause.type = type as EventType;
      }

      // Add property filter
      if (propertyId) {
        whereClause.property = { id: propertyId as string };
      }

      // Add unit filter
      if (unitId) {
        whereClause.unit = { id: unitId as string };
      }

      const events = await repo.find({
        where: whereClause,
        relations: ['property', 'unit', 'assignedTo', 'createdBy'],
        order: { startTime: 'ASC' }
      });

      return res.json({ events });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching events', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CalendarEvent);
      const { id } = req.params;
      const event = await repo.findOne({
        where: { id },
        relations: ['property', 'unit', 'assignedTo', 'createdBy']
      });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      return res.json({ event });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching event', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CalendarEvent);
      const { id } = req.params;
      const updates = req.body;
      const event = await repo.findOne({ 
        where: { id },
        relations: ['assignedTo']
      });
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const oldAssignedToId = event.assignedTo?.id;
      Object.assign(event, updates);
      const errors = await validate(event);
      if (errors.length > 0) return res.status(400).json({ errors });
      await repo.save(event);

      // Create notification if assignment changed
      if (updates.assignedToId && updates.assignedToId !== oldAssignedToId) {
        const newAssignedTo = await AppDataSource.getRepository(User).findOne({
          where: { id: updates.assignedToId }
        });
        if (newAssignedTo) {
          await NotificationService.createEventNotification(
            NotificationType.EVENT_UPDATED,
            event,
            newAssignedTo,
            `You have been assigned to event: ${event.title}`
          );
        }
      }

      return res.json({ event });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating event', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CalendarEvent);
      const { id } = req.params;
      const event = await repo.findOne({ where: { id } });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      await repo.remove(event);
      return res.json({ message: 'Event deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting event', error });
    }
  }
} 