import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean, MinLength, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Property } from './Property';
import { MaintenanceRequest } from './MaintenanceRequest';
import { Payment } from './Payment';
import { Notification } from './Notification';
import { Lease } from './Lease';

export enum UserRole {
  TENANT = 'tenant',
  PROPERTY_MANAGER = 'property_manager',
  BUILDING_STAFF = 'building_staff',
  ADMIN = 'admin'
}

export enum StaffRole {
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  CONCIERGE = 'concierge',
  CLEANER = 'cleaner'
}

class Address {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

class EmergencyContact {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  phoneNumber: string;
}

class NotificationPreferences {
  @IsBoolean()
  email: boolean;

  @IsBoolean()
  push: boolean;

  @IsBoolean()
  sms: boolean;
}

class UserPreferences {
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPreferences)
  notifications: NotificationPreferences;

  @IsString()
  language: string;

  @IsString()
  timezone: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @Column()
  firstName: string;

  @IsString()
  @Column()
  lastName: string;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @IsString()
  @MinLength(6)
  @Column()
  password: string;

  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  phoneNumber: string;

  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TENANT
  })
  role: UserRole;

  @IsEnum(StaffRole)
  @IsOptional()
  @Column({
    type: 'enum',
    enum: StaffRole,
    nullable: true
  })
  staffRole?: StaffRole;

  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  profilePicture: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Address)
  @IsOptional()
  @Column({ type: 'jsonb', nullable: true })
  address: Address;

  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContact)
  @IsOptional()
  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: EmergencyContact;

  @IsBoolean()
  @Column({ default: true })
  isActive: boolean;

  @IsBoolean()
  @Column({ default: false })
  isVerified: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => UserPreferences)
  @IsOptional()
  @Column({ type: 'jsonb', nullable: true })
  preferences: UserPreferences;

  @OneToMany(() => Property, property => property.manager)
  managedProperties: Property[];

  @OneToMany(() => MaintenanceRequest, request => request.tenant)
  maintenanceRequests: MaintenanceRequest[];

  @OneToMany(() => Payment, (payment: Payment) => payment.tenant)
  payments: Payment[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Lease, lease => lease.tenant)
  leases: Lease[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 