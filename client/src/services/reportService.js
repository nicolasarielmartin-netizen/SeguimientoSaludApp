import api from './api'

// Si el servidor responde con error, axios entrega el JSON dentro de un Blob
export const readError = async (err) => {
  const data = err.response?.data
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message
    } catch {
      // Se usa el mensaje por defecto
    }
  }
  return data?.message || 'No se pudo generar el informe'
}

export const downloadHealthReport = async (from, to) => {
  const response = await api.get('/reports/pdf', {
    params: { from, to },
    responseType: 'blob'
  })

  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = 'informe-salud.pdf'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  URL.revokeObjectURL(url)
}
