import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { toISOString } from '../../utils/dateUtils'

const QUALITY_LABELS = ['', 'Terrible 😫', 'Bad 😕', 'Okay 😐', 'Good 😊', 'Amazing 🌟']

function buildISO(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

function getYesterday() {
  const d = new Date(); d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
function getToday() { return new Date().toISOString().slice(0, 10) }
function nowTime() { return new Date().toTimeString().slice(0, 5) }

export default function SleepLogger({ onClose }) {
  const { addEntry } = useStore()
  const [startDate, setStartDate] = useState(getYesterday())
  const [startTime, setStartTime] = useState('22:00')
  const [endDate, setEndDate] = useState(getToday())
  const [endTime, setEndTime] = useState(nowTime())
  const [quality, setQuality] = useState(4)
  const [notes, setNotes] = useState('')

  function submit(e) {
    e.preventDefault()
    const startISO = buildISO(startDate, startTime)
    const endISO   = buildISO(endDate, endTime)
    if (new Date(endISO) <= new Date(startISO)) {
      alert('Wake time must be after sleep time.')
      return
    }
    addEntry({
      id: makeId(), type: 'sleep',
      timestamp: endISO,
      startTime: startISO, endTime: endISO,
      quality, notes: notes.trim()
    })
    onClose()
  }

  const durationMs = new Date(`${endDate}T${endTime}`) - new Date(`${startDate}T${startTime}`)
  const durationH  = (durationMs / 1000 / 3600).toFixed(1)
  const validDuration = durationMs > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😴</span>
            <h2 className="text-xl font-bold">Log Sleep</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {validDuration && (
            <div className="text-center bg-violet-50 rounded-2xl py-3">
              <span className="text-3xl font-bold text-violet-600">{durationH}h</span>
              <p className="text-sm text-violet-500 mt-0.5">total sleep</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">SLEEP DATE</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">BED TIME</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">WAKE DATE</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">WAKE TIME</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">SLEEP QUALITY</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(q => (
                <button key={q} type="button" onClick={() => setQuality(q)}
                  className={`flex-1 py-2 rounded-xl text-lg transition-all ${
                    quality === q ? 'bg-violet-500 text-white shadow-sm scale-105' : 'bg-gray-100'
                  }`}
                >
                  {['😫','😕','😐','😊','🌟'][q-1]}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-violet-600 font-medium mt-1">{QUALITY_LABELS[quality]}</p>
          </div>

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            Log Sleep 😴
          </button>
        </form>
      </div>
    </div>
  )
}
