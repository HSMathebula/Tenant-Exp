import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Unit } from './Unit';
import { Document } from './Document';

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MaintenanceCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HVAC = 'hvac',
  STRUCTURAL = 'structural',
  APPLIANCE = 'appliance',
  PEST_CONTROL = 'pest_control',
  CLEANING = 'cleaning',
  OTHER = 'other'
}

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestNumber: string;

  @Column({
    type: 'enum',
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM
  })
  priority: MaintenancePriority;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.PENDING
  })
  status: MaintenanceStatus;

  @Column({
    type: 'enum',
    enum: MaintenanceCategory
  })
  category: MaintenanceCategory;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'text', array: true, default: [] })
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  location: {
    room: string;
    specificLocation: string;
  };

  @Column({ type: 'date', nullable: true })
  preferredDate: Date;

  @Column({ type: 'time', nullable: true })
  preferredTimeSlot: string;

  @Column({ type: 'jsonb', nullable: true })
  assignedTo: {
    staff: User;
    assignedDate: Date;
    notes: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  completion: {
    completedDate: Date;
    notes: string;
    cost: number;
    rating: number;
    feedback: string;
    comments: Array<{
      userId: string;
      comment: string;
      timestamp: Date;
    }>;
  };

  @ManyToOne(() => User, user => user.maintenanceRequests)
  tenant: User;

  @ManyToOne(() => Unit, unit => unit.maintenanceRequests)
  unit: Unit;

  @OneToMany(() => Document, document => document.maintenanceRequest)
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 