import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Property } from './Property';
import { User } from './User';
import { Lease } from './Lease';
import { MaintenanceRequest } from './MaintenanceRequest';
import { Payment } from './Payment';

export enum UnitStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  unitNumber: string;

  @Column()
  floor: number;

  @Column('decimal')
  squareFootage: number;

  @Column('decimal')
  monthlyRent: number;

  @Column('decimal')
  deposit: number;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.AVAILABLE
  })
  status: UnitStatus;

  @Column({ type: 'text', array: true, default: [] })
  features: string[];

  @Column({ type: 'text', array: true, default: [] })
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  floorPlan: {
    image: string;
    dimensions: string;
    rooms: {
      name: string;
      size: string;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  utilities: {
    electricity: {
      meterNumber: string;
      provider: string;
    };
    water: {
      meterNumber: string;
      provider: string;
    };
    gas: {
      meterNumber: string;
      provider: string;
    };
  };

  @ManyToOne(() => Property, property => property.units)
  property: Property;

  @ManyToOne(() => User, { nullable: true })
  currentTenant: User | null;

  @OneToMany(() => Lease, lease => lease.unit)
  leases: Lease[];

  @OneToMany(() => MaintenanceRequest, request => request.unit)
  maintenanceRequests: MaintenanceRequest[];

  @OneToMany(() => Payment, (payment: Payment) => payment.unit)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 