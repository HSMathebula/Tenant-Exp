import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Event } from './Event';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show'
}

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING
  })
  status: RegistrationStatus;

  @Column({ type: 'jsonb' })
  guestInfo: {
    name: string;
    email: string;
    phone: string;
    dietaryRestrictions?: string;
    specialRequirements?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  checkIn: {
    checkedInAt: Date;
    checkedInBy: string;
    notes: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  cancellation: {
    cancelledAt: Date;
    reason: string;
    refundStatus?: 'pending' | 'processed' | 'denied';
  };

  @Column({ type: 'jsonb', nullable: true })
  waitlist: {
    position: number;
    addedAt: Date;
    notifiedAt?: Date;
  };

  @ManyToOne(() => User, user => user.eventRegistrations)
  attendee: User;

  @ManyToOne(() => Event, event => event.registrations)
  event: Event;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 