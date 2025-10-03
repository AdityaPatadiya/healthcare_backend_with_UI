import api from './api';

export const doctorService = {
  async getAll() {
    const response = await api.get('/doctors/');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/doctors/${id}/`);
    return response.data;
  },

  async create(doctorData) {
    const response = await api.post('/doctors/', doctorData);
    return response.data;
  },

  async update(id, doctorData) {
    const response = await api.put(`/doctors/${id}/`, doctorData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/doctors/${id}/`);
  }
};
