import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Building } from './Building';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity('amenity_bookings')
export class AmenityBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amenityName: string;

  @Column()
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  guests: number;

  @Column('text')
  purpose: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @Column({ type: 'jsonb', nullable: true })
  approval: {
    approvedBy: string;
    approvedAt: Date;
    notes: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  cancellation: {
    cancelledBy: string;
    cancelledAt: Date;
    reason: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  checkIn: {
    checkedInAt: Date;
    checkedInBy: string;
    notes: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  checkOut: {
    checkedOutAt: Date;
    checkedOutBy: string;
    notes: string;
  };

  @ManyToOne(() => User, user => user.amenityBookings)
  user: User;

  @ManyToOne(() => Building, building => building.amenityBookings)
  building: Building;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 