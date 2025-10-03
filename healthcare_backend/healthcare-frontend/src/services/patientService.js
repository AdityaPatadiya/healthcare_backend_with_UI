import api from './api';

export const patientService = {
  async getAll(page = 1, search = '') {
    const response = await api.get('/patients/', {
      params: { page, search }
    });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/patients/${id}/`);
    return response.data;
  },

  async create(patientData) {
    const response = await api.post('/patients/', patientData);
    return response.data;
  },

  async update(id, patientData) {
    const response = await api.put(`/patients/${id}/`, patientData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/patients/${id}/`);
  }
};
