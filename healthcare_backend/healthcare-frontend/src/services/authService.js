import api from './api';
import { setToken, setRefreshToken, removeToken, removeRefreshToken } from '../utils/auth';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    if (response.data.access) {
      setToken(response.data.access);
      setRefreshToken(response.data.refresh);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.access) {
      setToken(response.data.access);
      setRefreshToken(response.data.refresh);
    }
    return response.data;
  },

  logout() {
    removeToken();
    removeRefreshToken();
  },

  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile/', userData);
    return response.data;
  }
};
