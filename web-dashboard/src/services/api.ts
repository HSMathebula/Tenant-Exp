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

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  property: {
    id: string;
    name: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface GetTicketsParams {
  search?: string;
  status?: string;
  priority?: string;
  propertyId?: string;
  tenantId?: string;
  assignedTo?: string;
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
  async getTickets(params?: GetTicketsParams): Promise<Ticket[]> {
    try {
      const response = await axios.get<Ticket[]>(`${this.baseURL}/tickets`, {
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

  async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    try {
      const response = await axios.post<Ticket>(`${this.baseURL}/tickets`, ticketData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<Ticket> {
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

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    try {
      const response = await axios.get<TicketComment[]>(`${this.baseURL}/tickets/${ticketId}/comments`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addTicketComment(ticketId: string, content: string): Promise<TicketComment> {
    try {
      const response = await axios.post<TicketComment>(
        `${this.baseURL}/tickets/${ticketId}/comments`,
        { content },
        {
          headers: this.getHeaders(),
        }
      );
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