export interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  type: string;
  size: number;
  url: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'tenant' | 'admin' | 'property_manager';
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  type: 'rent' | 'deposit' | 'maintenance' | 'other';
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'maintenance' | 'social' | 'emergency' | 'other';
} 