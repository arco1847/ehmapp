// Configuration for connecting to local backend
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

// Database connection status
export const DB_CONFIG = {
  HOST: 'localhost',
  PORT: 3000,
  DATABASE: 'EMP',
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    BY_ID: (id: number) => `/prescriptions/${id}`,
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: number) => `/appointments/${id}`,
  },
  DOCTORS: {
    BASE: '/doctors',
    BY_ID: (id: number) => `/doctors/${id}`,
  },
  HEALTH: {
    STATS: '/health/stats',
  },
  USER: {
    PROFILE: '/user/profile',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
  },
  OCR: {
    PROCESS: '/ocr/process',
  },
};