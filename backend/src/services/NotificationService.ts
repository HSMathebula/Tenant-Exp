import { AppDataSource } from '../data-source';
import { Notification, NotificationType } from '../models/Notification';
import { CalendarEvent } from '../models/CalendarEvent';
import { User } from '../models/User';

interface NotificationWhereClause {
  userId: string;
  isRead?: boolean;
}

interface RosterMetadata {
  rosterId: string;
  shiftId?: string;
  date?: Date;
  status?: string;
  [key: string]: unknown;
}

export class NotificationService {
  static async createEventNotification(
    type: NotificationType,
    event: CalendarEvent,
    user: User,
    message: string
  ) {
    const repo = AppDataSource.getRepository(Notification);
    const notification = repo.create({
      type,
      title: `Calendar Event: ${event.title}`,
      message,
      user,
      userId: user.id,
      metadata: {
        eventId: event.id,
        eventType: event.type,
        startTime: event.startTime,
        endTime: event.endTime
      }
    });
    await repo.save(notification);
    return notification;
  }

  static async createRosterNotification(
    type: NotificationType,
    user: User,
    message: string,
    metadata: RosterMetadata
  ) {
    const repo = AppDataSource.getRepository(Notification);
    const notification = repo.create({
      type,
      title: 'Roster Update',
      message,
      user,
      userId: user.id,
      metadata
    });
    await repo.save(notification);
    return notification;
  }

  static async getUserNotifications(userId: string, isRead?: boolean) {
    const repo = AppDataSource.getRepository(Notification);
    const whereClause: NotificationWhereClause = { userId };
    if (isRead !== undefined) {
      whereClause.isRead = isRead;
    }
    return repo.find({
      where: whereClause,
      relations: ['event'],
      order: { createdAt: 'DESC' }
    });
  }

  static async markAsRead(notificationId: string) {
    const repo = AppDataSource.getRepository(Notification);
    const notification = await repo.findOne({ where: { id: notificationId } });
    if (notification) {
      notification.isRead = true;
      await repo.save(notification);
    }
    return notification;
  }
} 