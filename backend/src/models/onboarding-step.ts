import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export enum OnboardingStepType {
  PERSONAL_INFO = 'personal_info',
  PROPERTY_DETAILS = 'property_details',
  DOCUMENTS = 'documents',
  PREFERENCES = 'preferences',
  AMENITIES = 'amenities',
  VERIFICATION = 'verification'
}

export enum OnboardingStepStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

@Entity()
export class OnboardingStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: OnboardingStepType
  })
  type: OnboardingStepType;

  @Column({
    type: 'enum',
    enum: OnboardingStepStatus,
    default: OnboardingStepStatus.PENDING
  })
  status: OnboardingStepStatus;

  @Column('jsonb', { nullable: true })
  data: Record<string, any>;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 