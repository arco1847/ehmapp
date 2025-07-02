// API utility functions for making HTTP requests to local backend

import { API_CONFIG, ENDPOINTS } from './config';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function makeRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get token from storage if available
  const token = await getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'Request failed', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw new ApiError('Network error - Make sure backend server is running', 0);
  }
}

// Token management
async function getAuthToken(): Promise<string | null> {
  try {
    // In a real app, you'd use secure storage
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
}

async function setAuthToken(token: string): Promise<void> {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Failed to store auth token:', error);
  }
}

async function removeAuthToken(): Promise<void> {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await makeRequest(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      await setAuthToken(response.token);
    }
    
    return response;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    const response = await makeRequest(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      await setAuthToken(response.token);
    }
    
    return response;
  },

  forgotPassword: (email: string) =>
    makeRequest(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  logout: async () => {
    await removeAuthToken();
  },
};

// Prescriptions API
export const prescriptionsApi = {
  getAll: (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.PRESCRIPTIONS.BASE}?${queryString}` : ENDPOINTS.PRESCRIPTIONS.BASE;
    
    return makeRequest(endpoint);
  },

  getById: (id: number) =>
    makeRequest(ENDPOINTS.PRESCRIPTIONS.BY_ID(id)),

  create: (prescriptionData: any) =>
    makeRequest(ENDPOINTS.PRESCRIPTIONS.BASE, {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    }),

  update: (id: number, updateData: any) =>
    makeRequest(ENDPOINTS.PRESCRIPTIONS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  delete: (id: number) =>
    makeRequest(ENDPOINTS.PRESCRIPTIONS.BY_ID(id), {
      method: 'DELETE',
    }),
};

// Appointments API
export const appointmentsApi = {
  getAll: (filters?: { status?: string; upcoming?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.upcoming) params.append('upcoming', 'true');
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.APPOINTMENTS.BASE}?${queryString}` : ENDPOINTS.APPOINTMENTS.BASE;
    
    return makeRequest(endpoint);
  },

  getById: (id: number) =>
    makeRequest(ENDPOINTS.APPOINTMENTS.BY_ID(id)),

  create: (appointmentData: any) =>
    makeRequest(ENDPOINTS.APPOINTMENTS.BASE, {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),

  update: (id: number, updateData: any) =>
    makeRequest(ENDPOINTS.APPOINTMENTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  cancel: (id: number) =>
    makeRequest(ENDPOINTS.APPOINTMENTS.BY_ID(id), {
      method: 'DELETE',
    }),
};

// Doctors API
export const doctorsApi = {
  getAll: (filters?: { specialty?: string; search?: string; location?: string }) => {
    const params = new URLSearchParams();
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location) params.append('location', filters.location);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.DOCTORS.BASE}?${queryString}` : ENDPOINTS.DOCTORS.BASE;
    
    return makeRequest(endpoint);
  },

  getById: (id: number) =>
    makeRequest(ENDPOINTS.DOCTORS.BY_ID(id)),
};

// OCR API
export const ocrApi = {
  processImage: (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return makeRequest(ENDPOINTS.OCR.PROCESS, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
};

// User Profile API
export const userApi = {
  getProfile: () =>
    makeRequest(ENDPOINTS.USER.PROFILE),

  updateProfile: (profileData: any) =>
    makeRequest(ENDPOINTS.USER.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: (filters?: { unreadOnly?: boolean; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.NOTIFICATIONS.BASE}?${queryString}` : ENDPOINTS.NOTIFICATIONS.BASE;
    
    return makeRequest(endpoint);
  },

  markAsRead: (id: number) =>
    makeRequest(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: 'PUT',
    }),

  create: (notificationData: any) =>
    makeRequest(ENDPOINTS.NOTIFICATIONS.BASE, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }),
};

// Health Stats API
export const healthApi = {
  getStats: () =>
    makeRequest(ENDPOINTS.HEALTH.STATS),
};

export { ApiError, getAuthToken, setAuthToken, removeAuthToken };