import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column('jsonb', { nullable: true })
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    maintenanceUpdates: boolean;
    communityAnnouncements: boolean;
    eventReminders: boolean;
  };

  @Column('jsonb', { nullable: true })
  amenityPreferences: {
    preferredAmenities: string[];
    usageFrequency: Record<string, string>;
  };

  @Column('jsonb', { nullable: true })
  communicationPreferences: {
    preferredLanguage: string;
    preferredContactMethod: string;
    preferredContactTime: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 