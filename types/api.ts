// Type definitions for API responses and data structures

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface Prescription {
  id: number;
  userId: number;
  medication: string;
  doctor: string;
  pharmacy?: string;
  date: string;
  status: 'Active' | 'Expired' | 'Cancelled';
  dosage: string;
  quantity?: string;
  refills: number;
  instructions?: string;
  strength?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  id: number;
  userId: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  type: 'In-Person' | 'Telemedicine';
  location?: string;
  notes?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  location: string;
  phone: string;
  email: string;
  bio: string;
  education: string;
  languages: string[];
  acceptsInsurance: boolean;
  availableSlots: {
    date: string;
    times: string[];
  }[];
  image: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'refill' | 'general';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
  scheduledFor: string;
}

export interface HealthStats {
  prescriptions: {
    total: number;
    active: number;
    expired: number;
    refillsAvailable: number;
  };
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  medications: {
    dailyMedications: number;
    asNeededMedications: number;
    totalDosesThisWeek: number;
    missedDoses: number;
  };
  healthMetrics: {
    lastCheckup: string;
    nextAppointment: string;
    activePrescriptions: number;
    healthScore: number;
  };
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
}

export interface OCRResult {
  medication: string;
  strength: string;
  dosage: string;
  quantity: string;
  doctor: string;
  pharmacy: string;
  date: string;
  refills: string;
  instructions: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page?: number;
  limit?: number;
}