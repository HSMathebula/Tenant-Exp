import { AppDataSource } from '../data-source';
import { Notification, NotificationType } from '../models/Notification';
import { User } from '../models/User';
import { BuildingAssignment } from '../models/BuildingAssignment';
import { AppError } from '../middleware/error.middleware';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);
  private expo: Expo;

  constructor() {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }

    // Initialize Expo SDK
    this.expo = new Expo();
  }

  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    referenceId?: string,
    buildingId?: string
  ): Promise<Notification> {
    const userRepository = AppDataSource.getRepository(User);
    const notificationRepository = AppDataSource.getRepository(Notification);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify user has access to the building if buildingId is provided
    if (buildingId) {
      const assignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: buildingId },
          isActive: true
        }
      });

      if (!assignment) {
        throw new AppError(403, 'User does not have access to this building');
      }
    }

    const notification = notificationRepository.create({
      user,
      title,
      message,
      type,
      metadata: { referenceId },
      building: buildingId ? { id: buildingId } : undefined,
      isRead: false,
      data: { buildingId } // Store buildingId in notification data
    });

    const savedNotification = await notificationRepository.save(notification);
    await this.sendPushNotification(userId, {
      title: title,
      body: message,
      data: { buildingId }
    });

    return savedNotification;
  }

  private async sendPushNotification(userId: string, message: {
    title: string;
    body: string;
    data?: any;
  }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'pushToken', 'deviceType']
    });

    if (!user?.pushToken) return;

    if (user.deviceType === 'ios' || user.deviceType === 'android') {
      // Send via Expo for mobile devices
      const pushMessage: ExpoPushMessage = {
        to: user.pushToken,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: message.data,
      };

      try {
        const chunks = this.expo.chunkPushNotifications([pushMessage]);
        for (const chunk of chunks) {
          await this.expo.sendPushNotificationsAsync(chunk);
        }
      } catch (error) {
        console.error('Error sending push notification via Expo:', error);
      }
    } else {
      // Send via Firebase for web
      try {
        await admin.messaging().send({
          token: user.pushToken,
          notification: {
            title: message.title,
            body: message.body,
          },
          data: message.data,
        });
      } catch (error) {
        console.error('Error sending push notification via Firebase:', error);
      }
    }
  }

  static async getUserNotifications(
    userId: string,
    buildingId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: Notification[]; total: number }> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Verify user has access to the building if buildingId is provided
    if (buildingId) {
      const assignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: buildingId },
          isActive: true
        }
      });

      if (!assignment) {
        throw new AppError(403, 'User does not have access to this building');
      }
    }

    const query = {
      user: { id: userId },
      ...(buildingId && { building: { id: buildingId } })
    };

    const [notifications, total] = await notificationRepository.findAndCount({
      where: query,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { notifications, total };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    const notification = await notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['user']
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    // If notification is building-specific, verify access
    if (notification.data?.buildingId) {
      const assignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: notification.data.buildingId },
          isActive: true
        }
      });

      if (!assignment) {
        throw new AppError(403, 'User does not have access to this notification');
      }
    }

    notification.isRead = true;
    notification.readAt = new Date();
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

  async updatePushToken(userId: string, token: string, deviceType: 'ios' | 'android' | 'web') {
    await this.userRepository.update(
      { id: userId },
      { pushToken: token, deviceType }
    );
  }
} 