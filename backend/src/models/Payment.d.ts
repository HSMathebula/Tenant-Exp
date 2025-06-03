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

export class Payment {
  id: string;
  referenceNumber: string;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  lateFee: number | null;
  dueDate: Date;
  paidDate: Date | null;
  paymentDetails: {
    transactionId: string;
    gateway: string;
    cardLast4?: string;
    bankAccount?: string;
  } | null;
  receipts: string[];
  tenant: User;
  unit: Unit;
  lease: Lease;
  createdAt: Date;
  updatedAt: Date;
} 