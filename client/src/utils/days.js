const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Clave YYYY-MM-DD en hora local, para comparar días sin problemas de zona horaria
export const toDayKey = (value) => {
  const d = new Date(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Los últimos 7 días, del más antiguo al más reciente
export const lastSevenDays = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({ key: toDayKey(d), label: DAY_LABELS[d.getDay()] })
  }
  return days
}
