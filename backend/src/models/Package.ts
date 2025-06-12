import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Property } from './Property';

export enum PackageStatus {
  RECEIVED = 'received',
  NOTIFIED = 'notified',
  PICKED_UP = 'picked_up',
  EXPIRED = 'expired',
  RETURNED = 'returned'
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackingNumber: string;

  @Column()
  carrier: string;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.RECEIVED
  })
  status: PackageStatus;

  @Column({ type: 'jsonb' })
  details: {
    recipient: string;
    size: string;
    weight: string;
    notes: string;
    location: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  notification: {
    sentAt: Date;
    method: 'email' | 'sms' | 'push';
    status: 'sent' | 'failed';
  };

  @Column({ type: 'jsonb', nullable: true })
  pickup: {
    pickedUpAt: Date;
    pickedUpBy: string;
    notes: string;
  };

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @ManyToOne(() => User, user => user.packages)
  recipient: User;

  @ManyToOne(() => Property, property => property.packages)
  property: Property;

  @ManyToOne(() => User, { nullable: true })
  receivedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 