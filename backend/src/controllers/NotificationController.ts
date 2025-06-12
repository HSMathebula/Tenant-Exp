import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '../models/Notification';
import { User, UserRole } from '../models/User';
import { validate } from 'class-validator';
import { AppError } from '../utils/appError';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  static async create(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const userRepository = AppDataSource.getRepository(User);
      const { userId, type, priority, title, message, data, delivery } = req.body;

      // Get user
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create notification
      const notification = new Notification();
      notification.type = type;
      notification.priority = priority || NotificationPriority.MEDIUM;
      notification.title = title;
      notification.message = message;
      notification.data = data;
      notification.delivery = delivery || {
        email: true,
        push: true,
        sms: false,
        inApp: true
      };
      notification.status = NotificationStatus.UNREAD;
      notification.user = user;

      // Validate notification
      const errors = await validate(notification);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save notification
      await notificationRepository.save(notification);

      return res.status(201).json({
        message: 'Notification created successfully',
        notification
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating notification', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { status, type } = req.query;

      let whereClause: any = { user: { id: userId } };
      if (status) {
        whereClause.status = status;
      }
      if (type) {
        whereClause.type = type;
      }

      const notifications = await notificationRepository.find({
        where: whereClause,
        order: { createdAt: 'DESC' }
      });

      return res.json({ notifications });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching notifications', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const { id } = req.params;
      const userId = req.user?.userId;

      const notification = await notificationRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Verify user has access
      if (notification.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ notification });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching notification', error });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      return res.json({ notification });
    } catch (error) {
      return res.status(500).json({ message: 'Error marking notification as read', error });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const userId = req.user?.userId;

      await notificationRepository.update(
        { user: { id: userId }, status: NotificationStatus.UNREAD },
        { status: NotificationStatus.READ, readAt: new Date() }
      );

      return res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      return res.status(500).json({ message: 'Error marking notifications as read', error });
    }
  }

  static async archive(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const { id } = req.params;
      const userId = req.user?.userId;

      const notification = await notificationRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Verify user has access
      if (notification.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Archive notification
      notification.status = NotificationStatus.ARCHIVED;
      notification.archivedAt = new Date();
      await notificationRepository.save(notification);

      return res.json({
        message: 'Notification archived',
        notification
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error archiving notification', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const { id } = req.params;
      const userId = req.user?.userId;

      const notification = await notificationRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Verify user has access
      if (notification.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await notificationRepository.remove(notification);

      return res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting notification', error });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const userId = req.user?.userId;

      const count = await notificationRepository.count({
        where: {
          user: { id: userId },
          status: NotificationStatus.UNREAD
        }
      });

      return res.json({ unreadCount: count });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching unread count', error });
    }
  }

  static async getAllNotifications(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const notifications = await notificationRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' }
      });
      return res.json({ notifications });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching all notifications', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;

      const notification = await notificationRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      Object.assign(notification, updates);
      await notificationRepository.save(notification);

      return res.json({ notification });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating notification', error });
    }
  }

  static async getNotificationPreferences(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      // Mock data for notification preferences
      const preferences = {
        email: true,
        sms: false,
        push: true,
      };
      res.json(preferences);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { status } = req.query;
      const notifications = await NotificationService.getUserNotifications(
        userId,
        status as string
      );
      return res.json({ notifications });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching notifications', error });
    }
  }
} 