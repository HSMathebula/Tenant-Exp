import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsEnum, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { User } from './User';
import { Building } from './Building';
import { CalendarEvent } from './CalendarEvent';

export enum NotificationType {
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_UPDATED = 'EVENT_UPDATED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  EVENT_REMINDER = 'EVENT_REMINDER',
  ROSTER_ASSIGNED = 'ROSTER_ASSIGNED',
  ROSTER_CHANGED = 'ROSTER_CHANGED',
  MAINTENANCE = 'maintenance',
  PAYMENT = 'payment',
  ANNOUNCEMENT = 'announcement',
  EVENT = 'event',
  DOCUMENT = 'document',
  SYSTEM = 'system',
  TENANT_DEREGISTRATION = 'TENANT_DEREGISTRATION'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column()
  message: string;

  @IsEnum(NotificationType)
  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @IsBoolean()
  @Column({ default: false })
  isRead: boolean;

  @IsObject()
  @IsOptional()
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Building, { nullable: true })
  building: Building | null;

  @Column({ nullable: true })
  buildingId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CalendarEvent, { nullable: true })
  event: CalendarEvent | null;
} 