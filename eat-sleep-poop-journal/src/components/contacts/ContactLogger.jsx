import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { useToast } from '../../store/ToastContext'
import { toISOString } from '../../utils/dateUtils'

export default function ContactLogger({ onClose }) {
  const { addEntry } = useStore()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const now = new Date()
    const [h, m] = time.split(':')
    now.setHours(+h, +m, 0, 0)
    addEntry({
      id: makeId(), type: 'contact', timestamp: toISOString(now),
      name: name.trim(), subject: subject.trim(), description: description.trim(),
    })
    showToast('Contact logged 📇')
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
            <span className="text-2xl">📇</span>
            <h2 className="text-xl font-bold">Log Contact</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-3">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
            <input
              type="time"
              className="w-32 border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            placeholder="Subject / appointment"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
            placeholder="Description / outcome"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <button type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            Log Contact 📇
          </button>
        </form>
      </div>
    </div>
  )
}
