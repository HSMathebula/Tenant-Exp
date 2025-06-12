import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Building } from './Building';

export enum AssignmentType {
  TENANT = 'tenant',
  STAFF = 'staff'
}

@Entity('building_assignments')
export class BuildingAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Building, building => building.assignments)
  building: Building;

  @Column({
    type: 'enum',
    enum: AssignmentType
  })
  type: AssignmentType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    role?: string;
    responsibilities?: string[];
    accessLevel?: string;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 