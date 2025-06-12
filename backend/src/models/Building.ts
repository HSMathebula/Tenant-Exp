import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { BuildingAssignment } from './BuildingAssignment';
import { Unit } from './Unit';
import { User } from './User';
import { AmenityBooking } from './AmenityBooking';

export enum BuildingType {
  APARTMENT = 'apartment',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  HOUSE = 'house',
  MIXED_USE = 'mixed_use'
}

export enum BuildingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_CONSTRUCTION = 'under_construction',
  RENOVATION = 'renovation'
}

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({
    type: 'enum',
    enum: BuildingType,
    default: BuildingType.APARTMENT
  })
  type: BuildingType;

  @Column({
    type: 'enum',
    enum: BuildingStatus,
    default: BuildingStatus.ACTIVE
  })
  status: BuildingStatus;

  @Column({ type: 'int' })
  totalUnits: number;

  @Column({ type: 'int' })
  occupiedUnits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRent: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  amenities: string[];

  @Column({ type: 'int', nullable: true })
  yearBuilt: number;

  @Column({ type: 'int', nullable: true })
  floors: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalSquareFootage: number;

  @Column({ type: 'boolean', default: true })
  hasParking: boolean;

  @Column({ type: 'int', nullable: true })
  parkingSpaces: number;

  @Column({ type: 'boolean', default: false })
  hasGym: boolean;

  @Column({ type: 'boolean', default: false })
  hasPool: boolean;

  @Column({ type: 'boolean', default: false })
  hasLaundry: boolean;

  @Column({ type: 'boolean', default: false })
  isPetFriendly: boolean;

  @Column({ type: 'text', nullable: true })
  petPolicy: string;

  @Column({ type: 'text', nullable: true })
  smokingPolicy: string;

  @Column({ type: 'text', nullable: true })
  additionalRules: string;

  @Column({ type: 'text', nullable: true })
  contactInfo: string;

  @Column({ type: 'text', nullable: true })
  emergencyContact: string;

  @Column({ type: 'text', nullable: true })
  maintenanceContact: string;

  @Column({ type: 'text', nullable: true })
  officeHours: string;

  @Column({ type: 'text', nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: true })
  floorPlans: string[];

  @Column({ type: 'text', nullable: true })
  documents: string[];

  @ManyToOne(() => User)
  manager: User;

  @OneToMany(() => BuildingAssignment, assignment => assignment.building)
  assignments: BuildingAssignment[];

  @OneToMany(() => Unit, unit => unit.building)
  units: Unit[];

  @OneToMany(() => AmenityBooking, booking => booking.building)
  amenityBookings: AmenityBooking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 