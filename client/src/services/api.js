import axios from 'axios'

// Acepta la variable con o sin /api al final
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const baseURL = raw.replace(/\/+$/, '').replace(/\/api$/, '') + '/api'

const api = axios.create({
  baseURL,
  withCredentials: true
})

export default api