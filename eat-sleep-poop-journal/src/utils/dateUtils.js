import { format, isToday, isYesterday, differenceInDays, parseISO, startOfDay, subDays } from 'date-fns'

export function formatTime(isoString) {
  return format(parseISO(isoString), 'h:mm a')
}

export function formatDate(isoString) {
  const d = parseISO(isoString)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEE, MMM d')
}

export function formatDateShort(isoString) {
  return format(parseISO(isoString), 'MMM d')
}

export function toISOString(date = new Date()) {
  return date.toISOString()
}

export function groupByDay(entries) {
  const groups = {}
  entries.forEach(entry => {
    const day = format(parseISO(entry.timestamp || entry.startTime), 'yyyy-MM-dd')
    if (!groups[day]) groups[day] = []
    groups[day].push(entry)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, items]) => ({ day, label: formatDate(day + 'T12:00:00'), items }))
}

export function getStreaks(entries, type) {
  const filtered = entries.filter(e => e.type === type)
  if (!filtered.length) return 0

  const days = new Set(
    filtered.map(e => format(parseISO(e.timestamp || e.startTime), 'yyyy-MM-dd'))
  )

  let streak = 0
  let date = startOfDay(new Date())
  while (days.has(format(date, 'yyyy-MM-dd'))) {
    streak++
    date = subDays(date, 1)
  }
  // if today not logged, check if yesterday was (yesterday streak)
  if (streak === 0) {
    date = subDays(startOfDay(new Date()), 1)
    while (days.has(format(date, 'yyyy-MM-dd'))) {
      streak++
      date = subDays(date, 1)
    }
  }
  return streak
}

export function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return days
}

export function getDurationLabel(startISO, endISO) {
  const diff = (new Date(endISO) - new Date(startISO)) / 1000 / 60
  const h = Math.floor(diff / 60)
  const m = Math.round(diff % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
