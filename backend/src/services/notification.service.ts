import { AppDataSource } from '../data-source';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    relatedEntityId?: string
  ): Promise<Notification> {
    const userRepository = AppDataSource.getRepository(User);
    const notificationRepository = AppDataSource.getRepository(Notification);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const notification = notificationRepository.create({
      user,
      title,
      message,
      type,
      relatedEntityId,
      isRead: false
    });

    return notificationRepository.save(notification);
  }

  static async getUserNotifications(userId: string, page: number = 1, limit: number = 10): Promise<{ notifications: Notification[]; total: number }> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const [notifications, total] = await notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { notifications, total };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notification = await notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } }
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    notification.isRead = true;
    return notificationRepository.save(notification);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    await notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    );
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const result = await notificationRepository.delete({
      id: notificationId,
      user: { id: userId }
    });

    if (result.affected === 0) {
      throw new AppError(404, 'Notification not found');
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    return notificationRepository.count({
      where: { user: { id: userId }, isRead: false }
    });
  }
} 