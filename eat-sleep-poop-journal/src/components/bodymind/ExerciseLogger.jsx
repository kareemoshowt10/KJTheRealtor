import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { useToast } from '../../store/ToastContext'
import { toISOString } from '../../utils/dateUtils'

const QUICK_EXERCISES = ['Pushups', 'Pullups', 'Squats', 'Muscle', 'Run', 'Bike', 'Yoga', 'Lift']

export default function ExerciseLogger({ onClose }) {
  const { addEntry } = useStore()
  const { showToast } = useToast()
  const [exercise, setExercise] = useState('')
  const [count, setCount] = useState('')
  const [durationLocation, setDurationLocation] = useState('')
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))
  const [notes, setNotes] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!exercise.trim()) return
    const now = new Date()
    const [h, m] = time.split(':')
    now.setHours(+h, +m, 0, 0)
    addEntry({
      id: makeId(), type: 'exercise', timestamp: toISOString(now),
      exercise: exercise.trim(),
      count: count.trim(),
      durationLocation: durationLocation.trim(),
      notes: notes.trim(),
    })
    showToast('Workout logged 💪')
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
            <span className="text-2xl">💪</span>
            <h2 className="text-xl font-bold">Log Exercise</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_EXERCISES.map(ex => (
              <button key={ex} type="button" onClick={() => setExercise(ex)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  exercise === ex ? 'bg-lime-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}>
                {ex}
              </button>
            ))}
          </div>

          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
            placeholder="Exercise name *"
            value={exercise}
            onChange={e => setExercise(e.target.value)}
            required
            autoFocus
          />

          <div className="flex gap-3">
            <input
              className="w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
              placeholder="How many? (reps/sets)"
              value={count}
              onChange={e => setCount(e.target.value)}
            />
            <input
              className="w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
              placeholder="How long / where?"
              value={durationLocation}
              onChange={e => setDurationLocation(e.target.value)}
            />
          </div>

          <input
            type="time"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 resize-none"
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button type="submit"
            className="w-full bg-lime-600 hover:bg-lime-700 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            Log Exercise 💪
          </button>
        </form>
      </div>
    </div>
  )
}
