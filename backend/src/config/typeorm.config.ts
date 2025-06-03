import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Unit } from '../models/Unit';
import { MaintenanceRequest } from '../models/MaintenanceRequest';
import { Payment } from '../models/Payment';
import { Notification } from '../models/Notification';
import { Lease } from '../models/Lease';
import { Document } from '../models/Document';
import { Event } from '../models/Event';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'changeme',
  database: process.env.DB_NAME || 'tenant_experience',
  synchronize: true, // Set to false in production
  logging: true,
  entities: [
    User,
    Property,
    Unit,
    MaintenanceRequest,
    Payment,
    Notification,
    Lease,
    Document,
    Event
  ],
  migrations: [],
  subscribers: [],
}); 