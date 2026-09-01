import axiosClient from '../axiosClient';

export const reportsApi = {
  create: (payload) => axiosClient.post('/reports', payload),
  mine: () => axiosClient.get('/reports/mine'),
  getById: (id) => axiosClient.get(`/reports/${id}`),
};
