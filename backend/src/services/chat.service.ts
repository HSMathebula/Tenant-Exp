import { AppDataSource } from '../data-source';
import { Chat } from '../models/Chat';
import { ChatMessage } from '../models/ChatMessage';
import { BuildingAssignment } from '../models/BuildingAssignment';
import { AppError } from '../middleware/error.middleware';
import { Server } from 'socket.io';
import { User } from '../models/User';

export class ChatService {
  private io: Server;
  private messageRepository = AppDataSource.getRepository(ChatMessage);
  private chatRepository = AppDataSource.getRepository(Chat);
  private userRepository = AppDataSource.getRepository(User);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('authenticate', async (userId: string) => {
        this.connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
      });

      socket.on('disconnect', () => {
        const userId = Array.from(this.connectedUsers.entries())
          .find(([_, socketId]) => socketId === socket.id)?.[0];
        if (userId) {
          this.connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });

      socket.on('send_message', async (data: {
        chatId: string;
        senderId: string;
        content: string;
      }) => {
        try {
          const message = await this.createMessage(data);
          const chat = await this.chatRepository.findOne({
            where: { id: data.chatId },
            relations: ['participants']
          });
          
          if (chat) {
            chat.participants.forEach(participant => {
              const socketId = this.connectedUsers.get(participant.id);
              if (socketId && participant.id !== data.senderId) {
                this.io.to(socketId).emit('new_message', message);
              }
            });
          }
          
          socket.emit('message_sent', message);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('typing', async (data: { chatId: string; senderId: string }) => {
        try {
          const chat = await this.chatRepository.findOne({
            where: { id: data.chatId },
            relations: ['participants']
          });
          
          if (chat) {
            chat.participants.forEach(participant => {
              const socketId = this.connectedUsers.get(participant.id);
              if (socketId && participant.id !== data.senderId) {
                this.io.to(socketId).emit('user_typing', { userId: data.senderId });
              }
            });
          }
        } catch (error) {
          console.error('Error handling typing event:', error);
        }
      });

      socket.on('stop_typing', async (data: { chatId: string; senderId: string }) => {
        try {
          const chat = await this.chatRepository.findOne({
            where: { id: data.chatId },
            relations: ['participants']
          });
          
          if (chat) {
            chat.participants.forEach(participant => {
              const socketId = this.connectedUsers.get(participant.id);
              if (socketId && participant.id !== data.senderId) {
                this.io.to(socketId).emit('user_stop_typing', { userId: data.senderId });
              }
            });
          }
        } catch (error) {
          console.error('Error handling stop typing event:', error);
        }
      });
    });
  }

  async createMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<ChatMessage> {
    const message = this.messageRepository.create({
      chat: { id: data.chatId },
      sender: { id: data.senderId },
      content: data.content
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update the chat's lastMessage
    await this.chatRepository.update(data.chatId, {
      lastMessage: { id: savedMessage.id }
    });

    return savedMessage;
  }

  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0) {
    return await this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, sender: { id: userId } }
    });

    if (!message) {
      return false;
    }

    await this.messageRepository.remove(message);
    return true;
  }

  static async createChat(
    userId: string,
    title: string,
    buildingId: string,
    participants: string[]
  ): Promise<Chat> {
    const chatRepository = AppDataSource.getRepository(Chat);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Verify user has access to the building
    const userAssignment = await buildingAssignmentRepository.findOne({
      where: {
        user: { id: userId },
        building: { id: buildingId },
        isActive: true
      }
    });

    if (!userAssignment) {
      throw new AppError(403, 'User does not have access to this building');
    }

    // Verify all participants have access to the building
    for (const participantId of participants) {
      const participantAssignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: participantId },
          building: { id: buildingId },
          isActive: true
        }
      });

      if (!participantAssignment) {
        throw new AppError(403, `User ${participantId} does not have access to this building`);
      }
    }

    const chat = chatRepository.create({
      title,
      building: { id: buildingId },
      participants: [...participants, userId].map(id => ({ id })),
      createdBy: { id: userId }
    });

    return chatRepository.save(chat);
  }

  static async getUserChats(userId: string, buildingId: string): Promise<Chat[]> {
    const chatRepository = AppDataSource.getRepository(Chat);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Verify user has access to the building
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

    return await chatRepository.find({
      where: {
        building: { id: buildingId },
        participants: { id: userId }
      },
      relations: ['participants', 'createdBy', 'lastMessage'],
      order: { updatedAt: 'DESC' }
    });
  }
} 