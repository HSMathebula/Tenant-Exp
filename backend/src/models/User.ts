import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean, MinLength, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Property } from './Property';
import { MaintenanceRequest } from './MaintenanceRequest';
import { Payment } from './Payment';
import { Notification } from './Notification';
import { Lease } from './Lease';
import { Package } from './Package';
import { AmenityBooking } from './AmenityBooking';
import { EventRegistration } from './EventRegistration';
import { Document } from './Document';
import { OnboardingStep } from './OnboardingStep';
import { UserPreference } from './UserPreference';

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

  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  pushToken: string;

  @Column({
    type: 'enum',
    enum: ['ios', 'android', 'web'],
    nullable: true
  })
  deviceType: 'ios' | 'android' | 'web';

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

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    onboardingSteps?: {
      id: string;
      title: string;
      description: string;
      isCompleted: boolean;
      required: boolean;
    }[];
    onboardingStatus?: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
      };
    };
    propertyInfo?: {
      propertyId: string;
      unitNumber: string;
      moveInDate: Date;
      leaseStartDate: Date;
      leaseEndDate: Date;
    };
    documents?: {
      idVerification: string;
      proofOfIncome: string;
      leaseAgreement: string;
      insuranceDocument: string;
    };
    preferences?: {
      preferredContactMethod: string;
      preferredLanguage: string;
      notificationPreferences: {
        maintenance: boolean;
        announcements: boolean;
        payments: boolean;
        events: boolean;
      };
    };
    amenities?: {
      parking: boolean;
      storage: boolean;
      pets: boolean;
      additionalServices: string[];
    };
  };

  @OneToMany(() => Package, pkg => pkg.recipient)
  packages: Package[];

  @OneToMany(() => AmenityBooking, booking => booking.tenant)
  amenityBookings: AmenityBooking[];

  @OneToMany(() => EventRegistration, registration => registration.attendee)
  eventRegistrations: EventRegistration[];

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

  @OneToMany(() => Document, document => document.user)
  documents: Document[];

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  onboardingCompletedAt: Date | null;

  @OneToMany(() => OnboardingStep, step => step.user)
  onboardingSteps: OnboardingStep[];

  @OneToMany(() => UserPreference, preference => preference.user)
  userPreferences: UserPreference[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 