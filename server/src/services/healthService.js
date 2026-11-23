import api from './api'
export const getIndicators = () =>
  api.get('/health/indicators').then((r) => r.data)
export const createIndicator = (data) =>
  api.post('/health/indicators', data).then((r) => r.data)
export const createHealthRecord = (id, data) =>
  api.post(`/health/indicators/${id}/records`, data).then((r) => r.data)
export const getHealthRecords = (id) =>
  api.get(`/health/indicators/${id}/records`).then((r) => r.data)
