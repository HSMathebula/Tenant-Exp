import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Property } from './Property';
import { Unit } from './Unit';
import { OnboardingStep } from './OnboardingStep';

export enum DocumentType {
  ID_PROOF = 'id_proof',
  INCOME_PROOF = 'income_proof',
  ADDRESS_PROOF = 'address_proof',
  LEASE_AGREEMENT = 'lease_agreement',
  INSURANCE = 'insurance',
  OTHER = 'other'
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  ACTIVE = 'active'
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  stepId: string;

  @ManyToOne(() => OnboardingStep)
  step: OnboardingStep;

  @Column({
    type: 'enum',
    enum: DocumentType
  })
  type: DocumentType;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, string | number | boolean | null>;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING
  })
  status: DocumentStatus;

  @ManyToOne(() => Property)
  property: Property;

  @ManyToOne(() => Unit, { nullable: true })
  unit: Unit | null;

  @ManyToOne(() => User)
  uploadedBy: User;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  rejectedReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 