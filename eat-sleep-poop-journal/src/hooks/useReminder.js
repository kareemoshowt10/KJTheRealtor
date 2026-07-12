import { useEffect } from 'react'
import { format } from 'date-fns'
import { useStore } from '../store/useStore'

const LAST_FIRED_KEY = 'esp_reminder_last_fired'
const NOTIFICATION_ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>"

export function useReminder(navigate) {
  const { state } = useStore()
  const { reminderEnabled, reminderTime } = state.settings

  useEffect(() => {
    if (!reminderEnabled || !reminderTime) return
    if (typeof Notification === 'undefined') return

    const check = () => {
      if (Notification.permission !== 'granted') return
      const now = new Date()
      const todayStr = format(now, 'yyyy-MM-dd')
      const nowHM = format(now, 'HH:mm')
      if (nowHM !== reminderTime) return
      if (localStorage.getItem(LAST_FIRED_KEY) === todayStr) return

      localStorage.setItem(LAST_FIRED_KEY, todayStr)
      const notification = new Notification('Life OS', {
        body: 'Time to reflect on your day 🧭',
        icon: NOTIFICATION_ICON,
        tag: 'life-os-reflect-reminder',
      })
      notification.onclick = () => {
        window.focus()
        navigate?.('reflect')
        notification.close()
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [reminderEnabled, reminderTime, navigate])
}
