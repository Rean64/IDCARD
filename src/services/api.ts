// API service for MINDEF ID-CARD application

import { config } from '../config/env';

// Use config with fallback
const API_BASE_URL = config?.API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Safe localStorage access
    try {
      this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    } catch (error) {
      this.token = null;
    }
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    try {
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.warn('Failed to access localStorage');
    }
  }

  // Get default headers
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return { data, message: data.message };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Applications
  async createApplication(applicationData: any) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
      headers: this.getHeaders(false), // Public route
    });
  }

  async getApplication(applicationId: string) {
    return this.request(`/applications/${applicationId}`, {
      headers: this.getHeaders(false), // Public route
    });
  }

  async getAllApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    idType?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.idType) searchParams.append('idType', params.idType);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/applications${query}`);
  }

  async updateApplicationStatus(applicationId: string, status: string, rejectionReason?: string) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async getApplicationStats() {
    return this.request('/applications/stats/overview');
  }

  async searchApplications(query: string, page = 1, limit = 20) {
    return this.request(`/applications/search/query?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // Payments
  async processPayment(paymentData: {
    applicationId: string;
    amount: number;
    method: string;
    paymentDetails: any;
  }) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: this.getHeaders(false), // Public route
    });
  }

  async verifyPayment(transactionId: string) {
    return this.request(`/payments/verify/${transactionId}`, {
      headers: this.getHeaders(false), // Public route
    });
  }

  async getPaymentMethods() {
    return this.request('/payments/methods/available', {
      headers: this.getHeaders(false), // Public route
    });
  }

  // Appointments
  async bookAppointment(appointmentData: {
    applicationId: string;
    locationId: string;
    date: string;
    timeSlot: string;
  }) {
    return this.request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
      headers: this.getHeaders(false), // Public route
    });
  }

  async getAvailability(locationId: string, date: string) {
    return this.request(`/appointments/availability?locationId=${locationId}&date=${date}`, {
      headers: this.getHeaders(false), // Public route
    });
  }

  async getAppointmentByConfirmation(confirmationNumber: string) {
    return this.request(`/appointments/confirmation/${confirmationNumber}`, {
      headers: this.getHeaders(false), // Public route
    });
  }

  async getAllAppointments(params?: {
    date?: string;
    locationId?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.locationId) searchParams.append('locationId', params.locationId);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/appointments${query}`);
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    return this.request(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Locations
  async getLocations() {
    return this.request('/locations', {
      headers: this.getHeaders(false), // Public route
    });
  }

  async getLocation(locationId: string) {
    return this.request(`/locations/${locationId}`, {
      headers: this.getHeaders(false), // Public route
    });
  }

  async createLocation(locationData: {
    name: string;
    address: string;
    district: string;
    workingHours: string;
    availableDays: number[];
    capacity?: number;
  }) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async updateLocation(locationId: string, locationData: any) {
    return this.request(`/locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async getLocationStats(locationId: string) {
    return this.request(`/locations/${locationId}/stats`);
  }

  // File uploads
  async uploadDocument(applicationId: string, documentType: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/upload/${applicationId}/${documentType}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
        // Don't set Content-Type for FormData
      } as HeadersInit,
    });
  }

  async deleteDocument(documentId: string) {
    return this.request(`/upload/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(false), // Public route for now
    });
  }

  async getApplicationDocuments(applicationId: string) {
    return this.request(`/upload/application/${applicationId}`, {
      headers: this.getHeaders(false), // Public route
    });
  }

  // Admin
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async bulkApproveApplications(applicationIds: string[]) {
    return this.request('/admin/applications/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ applicationIds }),
    });
  }

  async exportApplications(params?: {
    format?: 'csv' | 'json';
    status?: string;
    idType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.format) searchParams.append('format', params.format);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.idType) searchParams.append('idType', params.idType);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/admin/export/applications${query}`);
  }

  async generateReport(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/admin/reports/summary${query}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health', {
      headers: this.getHeaders(false),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;