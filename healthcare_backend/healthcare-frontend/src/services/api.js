import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, getRefreshToken, setToken, removeToken } from '../utils/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newToken = response.data.access;
          setToken(newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export the api instance
export default api;

// Service functions for different endpoints
export const authService = {
  login: (credentials) => api.post('/v1/auth/login/', credentials),
  register: (userData) => api.post('/v1/auth/register/', userData),
  getProfile: () => api.get('/v1/auth/profile/'),
  updateProfile: (userData) => api.put('/v1/auth/profile/', userData),
};

export const userService = {
  // Get all users (admin only)
  getAllUsers: () => api.get('/users/'),
  
  // Get specific user (admin only)
  getUser: (id) => api.get(`/users/${id}/`),
  
  // Update user (admin only)
  updateUser: (id, userData) => api.put(`/users/${id}/`, userData),
  
  // Delete user (if you add this endpoint later)
  deleteUser: (id) => api.delete(`/users/${id}/`),
};

export const patientService = {
  getAll: () => api.get('/v1/patients/'),
  getById: (id) => api.get(`/v1/patients/${id}/`),
  create: (data) => api.post('/v1/patients/', data),
  update: (id, data) => api.put(`/v1/patients/${id}/`, data),
  delete: (id) => api.delete(`/v1/patients/${id}/`),
};

export const doctorService = {
  getAll: () => api.get('/v1/doctors/'),
  getById: (id) => api.get(`/v1/doctors/${id}/`),
  create: (data) => api.post('/v1/doctors/', data),
  update: (id, data) => api.put(`/v1/doctors/${id}/`, data),
  delete: (id) => api.delete(`/v1/doctors/${id}/`),
};

export const mappingService = {
  getAll: () => api.get('/v1/mappings/'),
  getById: (id) => api.get(`/v1/mappings/${id}/`),
  create: (data) => api.post('/v1/mappings/', data),
  delete: (id) => api.delete(`/v1/mappings/${id}/`),
  getByPatient: (patientId) => api.get(`/v1/mappings/patient/${patientId}/`),
};
