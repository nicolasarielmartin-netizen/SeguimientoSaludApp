import axios from 'axios'

// Acepta la variable con o sin /api al final
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const baseURL = raw.replace(/\/+$/, '').replace(/\/api$/, '') + '/api'

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  const status = error.response?.status
  const retriable = !error.response || [502, 503, 504].includes(status)
  if (!config || config._retried || config.method !== 'get' || !retriable) {
    return Promise.reject(error)
  }
  config._retried = true
  await new Promise((r) => setTimeout(r, 2000))
  return api(config)
})

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
})

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  const status = error.response?.status
  const retriable = !error.response || [502, 503, 504].includes(status)
  if (!config || config._retried || config.method !== 'get' || !retriable) {
    return Promise.reject(error)
  }
  config._retried = true
  await new Promise((r) => setTimeout(r, 2000))
  return api(config)
})

export default api