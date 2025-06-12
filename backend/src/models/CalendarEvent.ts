import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Property } from './Property';
import { Unit } from './Unit';

export enum EventType {
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
  DELIVERY = 'DELIVERY',
  VISIT = 'VISIT',
  OTHER = 'OTHER'
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
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
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToOne(() => Property)
  property: Property;

  @ManyToOne(() => Unit, { nullable: true })
  unit: Unit | null;

  @ManyToOne(() => User)
  assignedTo: User;

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 