import api from './api'

export const getSymptoms = () =>
  api.get('/symptoms').then((r) => r.data)

export const createSymptom = (data) =>
  api.post('/symptoms', data).then((r) => r.data)

export const updateSymptom = (id, data) =>
  api.put(`/symptoms/${id}`, data).then((r) => r.data)

export const deleteSymptom = (id) =>
  api.delete(`/symptoms/${id}`).then((r) => r.data)

export const getSymptomRecords = (id) =>
  api.get(`/symptoms/${id}/records`).then((r) => r.data)

export const createSymptomRecord = (id, data) =>
  api.post(`/symptoms/${id}/records`, data).then((r) => r.data)

export const deleteSymptomRecord = (id, recordId) =>
  api.delete(`/symptoms/${id}/records/${recordId}`).then((r) => r.data)
