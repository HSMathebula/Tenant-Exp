import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from './User';
import { Unit } from './Unit';
import { Document } from './Document';
import { Event } from './Event';
import { Lease } from './Lease';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'jsonb' })
  location: {
    latitude: number;
    longitude: number;
  };

  @Column({ type: 'text', array: true, default: [] })
  amenities: string[];

  @Column({ type: 'text', array: true, default: [] })
  rules: string[];

  @Column({ type: 'text', array: true, default: [] })
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    phone: string;
    email: string;
    emergencyPhone: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: {
    office: {
      open: string;
      close: string;
    };
    maintenance: {
      open: string;
      close: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  securityInfo: {
    company: string;
    contact: string;
    procedures: string[];
  };

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.managedProperties)
  manager: User;

  @OneToMany(() => Unit, unit => unit.property)
  units: Unit[];

  @OneToMany(() => Document, document => document.property)
  documents: Document[];

  @OneToMany(() => Event, event => event.property)
  events: Event[];

  @OneToMany(() => Lease, lease => lease.property)
  leases: Lease[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 