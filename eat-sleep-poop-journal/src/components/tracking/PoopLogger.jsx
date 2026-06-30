import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { toISOString } from '../../utils/dateUtils'

const BRISTOL = [
  { type: 1, emoji: '🪨', label: 'Type 1', desc: 'Separate hard lumps' },
  { type: 2, emoji: '🍫', label: 'Type 2', desc: 'Lumpy sausage' },
  { type: 3, emoji: '🌭', label: 'Type 3', desc: 'Cracked surface' },
  { type: 4, emoji: '🍌', label: 'Type 4', desc: 'Smooth & soft ✅' },
  { type: 5, emoji: '🫘', label: 'Type 5', desc: 'Soft blobs' },
  { type: 6, emoji: '💩', label: 'Type 6', desc: 'Fluffy pieces' },
  { type: 7, emoji: '🌊', label: 'Type 7', desc: 'Liquid' },
]

const COLORS = ['Brown', 'Dark Brown', 'Yellow', 'Green', 'Black', 'Red']

export default function PoopLogger({ onClose }) {
  const { addEntry } = useStore()
  const [bristolType, setBristolType] = useState(4)
  const [color, setColor] = useState('Brown')
  const [notes, setNotes] = useState('')
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))

  function submit(e) {
    e.preventDefault()
    const now = new Date()
    const [h, m] = time.split(':')
    now.setHours(+h, +m, 0, 0)
    addEntry({
      id: makeId(), type: 'poop', timestamp: toISOString(now),
      bristolType, color, notes: notes.trim()
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💩</span>
            <h2 className="text-xl font-bold">Log Poop</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">BRISTOL SCALE (What type?)</label>
            <div className="grid grid-cols-7 gap-1.5">
              {BRISTOL.map(({ type, emoji }) => (
                <button key={type} type="button"
                  onClick={() => setBristolType(type)}
                  className={`flex flex-col items-center py-2 rounded-xl text-xl transition-all ${
                    bristolType === type
                      ? 'bg-amber-500 text-white shadow-sm scale-105'
                      : 'bg-gray-100'
                  }`}
                >
                  {emoji}
                  <span className="text-xs mt-0.5 font-medium">{type}</span>
                </button>
              ))}
            </div>
            {bristolType && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-2">
                <strong>{BRISTOL[bristolType-1].label}:</strong> {BRISTOL[bristolType-1].desc}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">COLOR</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    color === c ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <input
            type="time"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            Log Poop 💩
          </button>
        </form>
      </div>
    </div>
  )
}
