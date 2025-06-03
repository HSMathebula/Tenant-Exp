import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Unit } from './Unit';
import { Document } from './Document';
import { Payment } from './Payment';
import { Property } from './Property';

export enum LeaseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated'
}

@Entity('leases')
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  leaseNumber: string;

  @Column({
    type: 'enum',
    enum: LeaseStatus,
    default: LeaseStatus.DRAFT
  })
  status: LeaseStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal')
  rentAmount: number;

  @Column('decimal')
  depositAmount: number;

  @Column({ type: 'jsonb' })
  terms: {
    rentDueDay: number;
    lateFeePercentage: number;
    gracePeriodDays: number;
    noticePeriodMonths: number;
    renewalTerms: string;
    restrictions: string[];
  };

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ nullable: true })
  terminationReason: string;

  @Column({ type: 'jsonb', nullable: true })
  occupants: {
    name: string;
    relationship: string;
    age: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  pets: {
    type: string;
    breed: string;
    name: string;
    weight: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  utilities: {
    included: string[];
    excluded: string[];
    responsibility: string;
  };

  @Column({ type: 'text', array: true, default: [] })
  documents: string[];

  @ManyToOne(() => User, user => user.leases)
  tenant: User;

  @ManyToOne(() => Unit, unit => unit.leases)
  unit: Unit;

  @ManyToOne(() => Property, property => property.leases)
  property: Property;

  @OneToMany(() => Document, document => document.lease)
  leaseDocuments: Document[];

  @OneToMany(() => Payment, (payment: Payment) => payment.lease)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 