// API Configuration
const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:5000',
    API_URL: 'http://localhost:5000/api'
  },
  production: {
    BASE_URL: window.location.origin,
    API_URL: `${window.location.origin}/api`
  }
};

// Force production mode for Vercel deployment
const isVercel = window.location.hostname.includes('vercel.app');
const ENV = process.env.NODE_ENV || 'development';
const actualEnv = isVercel ? 'production' : ENV;
const config = API_CONFIG[actualEnv];

export const BASE_URL = config.BASE_URL;
export const API_URL = config.API_URL;

// Use consistent API base for all endpoints
const API_BASE = config.API_URL;

// Specific API endpoints
export const ENDPOINTS = {
  // Test
  TEST: `${API_BASE}/test`,
  
  // Auth
  LOGIN: `${API_BASE}/login`,
  REGISTER: `${API_BASE}/register`,
  
  // Products
  PRODUCTS: `${API_BASE}/products`,
  CATEGORIES: `${API_BASE}/categories`,
  
  // Cart & Orders
  CART: `${API_BASE}/cart`,
  ORDERS: `${API_BASE}/orders`,
  USER_ORDERS: `${API_BASE}/user-orders`,
  
  // Payment
  PAYMENT: `${API_BASE}/payment`,
  PAYMENT_NOTIFICATION: `${API_BASE}/payment/notification`,
  
  // Admin
  BUYERS: `${API_BASE}/buyers`,
  
  // User Profile
  PROFILE: `${API_BASE}/profile`
};

export default config;
