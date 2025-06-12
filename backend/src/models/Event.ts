import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { Property } from './Property';
import { EventRegistration } from './EventRegistration';

export enum EventType {
  COMMUNITY = 'community',
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  SOCIAL = 'social',
  MEETING = 'meeting',
  OTHER = 'other'
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: EventType
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.SCHEDULED
  })
  status: EventStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'text', array: true, default: [] })
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  location: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  capacity: {
    max: number;
    current: number;
    waitlist: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    ageRestriction?: number;
    dressCode?: string;
    itemsToBring?: string[];
    restrictions?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  contact: {
    organizer: string;
    phone: string;
    email: string;
  };

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ManyToOne(() => User)
  organizer: User;

  @ManyToOne(() => Property, property => property.events)
  property: Property;

  @ManyToMany(() => User)
  @JoinTable()
  attendees: User[];

  @OneToMany(() => EventRegistration, registration => registration.event)
  registrations: EventRegistration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 