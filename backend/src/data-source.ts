import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Unit } from './models/Unit';
import { Property } from './models/Property';
import { Lease } from './models/Lease';
import { MaintenanceRequest } from './models/MaintenanceRequest';
import { Payment } from './models/Payment';
import { Document } from './models/Document';
import { Event } from './models/Event';
import { Notification } from './models/Notification';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tenant_experience',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Unit, Property, Lease, MaintenanceRequest, Payment, Document, Event, Notification],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts']
}); 