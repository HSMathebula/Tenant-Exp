import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Unit } from './Unit';
import { Lease } from './Lease';

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  UTILITY = 'utility',
  LATE_FEE = 'late_fee',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  MOBILE_PAYMENT = 'mobile_payment',
  OTHER = 'other'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referenceNumber: string;

  @Column({
    type: 'enum',
    enum: PaymentType
  })
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  method: PaymentMethod;

  @Column('decimal')
  amount: number;

  @Column('decimal', { nullable: true })
  lateFee: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  paymentDetails: {
    transactionId: string;
    gateway: string;
    cardLast4?: string;
    bankAccount?: string;
  };

  @Column({ type: 'text', array: true, default: [] })
  receipts: string[];

  @ManyToOne(() => User, user => user.payments)
  tenant: User;

  @ManyToOne(() => Unit, unit => unit.payments)
  unit: Unit;

  @ManyToOne(() => Lease, lease => lease.payments)
  lease: Lease;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 