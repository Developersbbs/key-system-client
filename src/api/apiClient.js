// src/api/apiClient.js
import axios from 'axios';

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

const apiClient = axios.create({
  baseURL: isProduction 
    ? 'https://keysystem.in/api' 
    : 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('[API] Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your internet connection or try again later.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response.status === 401) {
      // Handle unauthorized
      error.message = 'Session expired. Please log in again.';
    } else if (error.response.status === 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;