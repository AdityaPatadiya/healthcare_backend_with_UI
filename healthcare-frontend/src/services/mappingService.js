import api from './api';

export const mappingService = {
  async getAll() {
    const response = await api.get('/mappings/');
    return response.data;
  },

  async getByPatient(patientId) {
    const response = await api.get(`/mappings/patient/${patientId}/`);
    return response.data;
  },

  async create(mappingData) {
    const response = await api.post('/mappings/', mappingData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/mappings/${id}/`);
  }
};
