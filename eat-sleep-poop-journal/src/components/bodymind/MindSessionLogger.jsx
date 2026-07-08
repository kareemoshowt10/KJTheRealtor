import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { useToast } from '../../store/ToastContext'
import { toISOString } from '../../utils/dateUtils'

const CONFIG = {
  meditation: {
    emoji: '🧘', label: 'Log Meditation',
    accent: 'text-teal-600', bg: 'bg-teal-500 hover:bg-teal-600',
    ring: 'focus:border-teal-400 focus:ring-teal-100', panel: 'bg-teal-50',
  },
  reading: {
    emoji: '📖', label: 'Log Reading',
    accent: 'text-sky-600', bg: 'bg-sky-500 hover:bg-sky-600',
    ring: 'focus:border-sky-400 focus:ring-sky-100', panel: 'bg-sky-50',
  },
}

function nowTime() { return new Date().toTimeString().slice(0, 5) }
function minusMinutes(mins) {
  const d = new Date(Date.now() - mins * 60000)
  return d.toTimeString().slice(0, 5)
}

export default function MindSessionLogger({ type, onClose }) {
  const { addEntry } = useStore()
  const { showToast } = useToast()
  const cfg = CONFIG[type]
  const [startTime, setStartTime] = useState(minusMinutes(20))
  const [endTime, setEndTime] = useState(nowTime())
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const startISO = `${today}T${startTime}:00`
  const endISO = `${today}T${endTime}:00`
  const durationMin = Math.round((new Date(endISO) - new Date(startISO)) / 60000)
  const valid = durationMin > 0

  function submit(e) {
    e.preventDefault()
    if (!valid) { alert('End time must be after start time.'); return }
    addEntry({
      id: makeId(), type,
      timestamp: toISOString(new Date(endISO)),
      startTime: toISOString(new Date(startISO)),
      endTime: toISOString(new Date(endISO)),
      durationMin, notes: notes.trim(),
    })
    showToast(type === 'meditation' ? 'Meditation logged 🧘' : 'Reading logged 📖')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cfg.emoji}</span>
            <h2 className="text-xl font-bold">{cfg.label}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {valid && (
            <div className={`text-center rounded-2xl py-3 ${cfg.panel}`}>
              <span className={`text-3xl font-bold ${cfg.accent}`}>{durationMin}</span>
              <span className={`text-lg font-bold ${cfg.accent}`}> min</span>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium block mb-1">START</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none ${cfg.ring}`} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium block mb-1">END</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none ${cfg.ring}`} />
            </div>
          </div>

          <textarea
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none resize-none ${cfg.ring}`}
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button type="submit"
            className={`w-full text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm ${cfg.bg}`}>
            Log {type === 'meditation' ? 'Meditation' : 'Reading'} {cfg.emoji}
          </button>
        </form>
      </div>
    </div>
  )
}
