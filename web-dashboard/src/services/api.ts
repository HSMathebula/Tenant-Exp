import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { useSnackbar } from 'notistack';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'tenant';
  avatar?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units: number;
  image?: string;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  avatar?: string;
}

export enum TicketCategory {
  PLUMBING = "plumbing",
  ELECTRICAL = "electrical",
  HVAC = "hvac",
  APPLIANCE = "appliance",
  STRUCTURAL = "structural",
  PEST = "pest",
  OTHER = "other",
}

export enum TicketPriority {
  LOW = "low",
  NORMAL = "normal",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

export enum TicketStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  WAITING_FOR_PARTS = "waiting_for_parts",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Ticket {
  id: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    unitNumber: string;
  };
  category: TicketCategory;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  scheduledDate?: string;
  completedDate?: string;
  images?: string[];
  notes?: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    text: string;
    createdAt: string;
  }[];
  accessInstructions?: string;
  materialsUsed?: {
    item: string;
    quantity: number;
  }[];
  timeSpent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketNote {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  text: string;
  createdAt: string;
}

export interface GetTicketsParams {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  propertyId?: string;
  tenantId?: string;
  assignedTo?: string;
  limit?: number;
  page?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'maintenance' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  properties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RevenueData {
  name: string;
  revenue: number;
}

export interface OccupancyData {
  name: string;
  value: number;
}

export interface MaintenanceData {
  category: string;
  total: number;
  completed: number;
  pending: number;
  avgResolutionTime: string;
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${this.baseURL}/auth/login`, {
        email,
        password,
      });
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${this.baseURL}/auth/register`, userData);
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get<User>(`${this.baseURL}/auth/me`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ticket methods
  async getTickets(params?: GetTicketsParams): Promise<{ tickets: Ticket[]; total: number }> {
    try {
      const response = await axios.get<{ tickets: Ticket[]; total: number }>(`${this.baseURL}/tickets`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTicket(id: string): Promise<Ticket> {
    try {
      const response = await axios.get<Ticket>(`${this.baseURL}/tickets/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTicket(ticketData: {
    category: TicketCategory;
    title: string;
    description: string;
    priority: TicketPriority;
    images?: string[];
    accessInstructions?: string;
  }): Promise<Ticket> {
    try {
      const response = await axios.post<Ticket>(`${this.baseURL}/tickets`, ticketData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTicket(id: string, ticketData: Partial<{
    category: TicketCategory;
    title: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    scheduledDate?: string;
    completedDate?: string;
    images?: string[];
    accessInstructions?: string;
  }>): Promise<Ticket> {
    try {
      const response = await axios.put<Ticket>(`${this.baseURL}/tickets/${id}`, ticketData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTicket(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/tickets/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addTicketNote(id: string, note: { text: string }): Promise<TicketNote> {
    try {
      const response = await axios.post<TicketNote>(`${this.baseURL}/tickets/${id}/notes`, note, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addTicketImage(id: string, image: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', image);
      
      const response = await axios.post<{ imageUrl: string }>(`${this.baseURL}/tickets/${id}/images`, formData, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addTicketMaterials(id: string, materials: { item: string; quantity: number }[]): Promise<Ticket> {
    try {
      const response = await axios.post<Ticket>(`${this.baseURL}/tickets/${id}/materials`, { materials }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTicketsByTenant(tenantId: string): Promise<Ticket[]> {
    try {
      const response = await axios.get<Ticket[]>(`${this.baseURL}/tickets/tenant/${tenantId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTicketsByProperty(propertyId: string): Promise<Ticket[]> {
    try {
      const response = await axios.get<Ticket[]>(`${this.baseURL}/tickets/property/${propertyId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTicketsByStaff(staffId: string): Promise<Ticket[]> {
    try {
      const response = await axios.get<Ticket[]>(`${this.baseURL}/tickets/staff/${staffId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    try {
      const response = await axios.get<Property[]>(`${this.baseURL}/properties`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProperty(id: string): Promise<Property> {
    try {
      const response = await axios.get<Property>(`${this.baseURL}/properties/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tenant methods
  async getTenants(params?: {
    status?: string;
    propertyId?: string;
    search?: string;
  }): Promise<Tenant[]> {
    try {
      const response = await axios.get<Tenant[]>(`${this.baseURL}/tenants`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTenant(id: string): Promise<Tenant> {
    try {
      const response = await axios.get<Tenant>(`${this.baseURL}/tenants/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Staff methods
  async getStaff(): Promise<any[]> {
    try {
      const response = await axios.get('/staff', {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Announcement methods
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await axios.get<Announcement[]>(`${this.baseURL}/announcements`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    try {
      const response = await axios.post<Announcement>(`${this.baseURL}/announcements`, announcementData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAnnouncement(id: string, announcementData: Partial<Announcement>): Promise<Announcement> {
    try {
      const response = await axios.put<Announcement>(`${this.baseURL}/announcements/${id}`, announcementData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/announcements/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Report methods
  async getRevenueReport(timeRange: string): Promise<RevenueData[]> {
    try {
      const response = await axios.get<RevenueData[]>(`${this.baseURL}/reports/revenue`, {
        headers: this.getHeaders(),
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOccupancyReport(timeRange: string): Promise<OccupancyData[]> {
    try {
      const response = await axios.get<OccupancyData[]>(`${this.baseURL}/reports/occupancy`, {
        headers: this.getHeaders(),
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMaintenanceReport(timeRange: string): Promise<MaintenanceData[]> {
    try {
      const response = await axios.get<MaintenanceData[]>(`${this.baseURL}/reports/maintenance`, {
        headers: this.getHeaders(),
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'An error occurred';
      return new Error(message);
    }
    return error;
  }
}

// Create and export a singleton instance
export const api = new ApiService();

// Custom hook for using the API with snackbar notifications
export const useApi = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await apiCall();
      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: 'success' });
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      enqueueSnackbar(errorMessage || message, { variant: 'error' });
      return null;
    }
  };

  return {
    handleApiCall,
  };
}; 