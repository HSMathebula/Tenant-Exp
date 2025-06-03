import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Property } from './Property';
import { Lease } from './Lease';
import { Unit } from './Unit';
import { MaintenanceRequest } from './MaintenanceRequest';

export enum DocumentType {
  LEASE = 'lease',
  IDENTIFICATION = 'identification',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  MAINTENANCE = 'maintenance',
  POLICY = 'policy',
  CERTIFICATE = 'certificate',
  OTHER = 'other'
}

export enum DocumentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: DocumentType
  })
  type: DocumentType;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    size: number;
    mimeType: string;
    uploadedBy: string;
    version: string;
  };

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE
  })
  status: DocumentStatus;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @ManyToOne(() => User, { nullable: true })
  uploadedBy: User;

  @ManyToOne(() => Property, { nullable: true })
  property: Property;

  @ManyToOne(() => Unit, { nullable: true })
  unit: Unit | null;

  @ManyToOne(() => Lease, { nullable: true })
  lease: Lease;

  @ManyToOne(() => MaintenanceRequest, { nullable: true })
  maintenanceRequest: MaintenanceRequest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 