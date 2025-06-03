import { User } from './User';

export class Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'maintenance' | 'payment' | 'announcement' | 'general';
  user: User;
  createdAt: Date;
} 