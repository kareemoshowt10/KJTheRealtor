import { useState } from 'react'
import { X, Utensils } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { useToast } from '../../store/ToastContext'
import { toISOString } from '../../utils/dateUtils'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink']
const QUICK_FOODS = ['Coffee ☕', 'Eggs 🍳', 'Salad 🥗', 'Pizza 🍕', 'Sandwich 🥪', 'Fruit 🍎', 'Water 💧', 'Smoothie 🥤']

export default function EatLogger({ onClose }) {
  const { addEntry } = useStore()
  const { showToast } = useToast()
  const [mealType, setMealType] = useState('Breakfast')
  const [food, setFood] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))

  function submit(e) {
    e.preventDefault()
    if (!food.trim()) return
    const now = new Date()
    const [h, m] = time.split(':')
    now.setHours(+h, +m, 0, 0)
    addEntry({
      id: makeId(), type: 'eat', timestamp: toISOString(now),
      mealType, food: food.trim(),
      calories: calories ? +calories : null,
      notes: notes.trim()
    })
    showToast('Meal logged 🍽️')
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
            <span className="text-2xl">🍽️</span>
            <h2 className="text-xl font-bold">Log Meal</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Meal type */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {MEAL_TYPES.map(t => (
              <button
                key={t} type="button" onClick={() => setMealType(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  mealType === t
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Quick picks */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">QUICK PICKS</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_FOODS.map(f => (
                <button
                  key={f} type="button"
                  onClick={() => setFood(f.replace(/\s*[\u{1F300}-\u{1FAD6}]/gu, '').trim() || f)}
                  className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm hover:bg-orange-100 transition-colors"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Food name */}
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="What did you eat? *"
            value={food}
            onChange={e => setFood(e.target.value)}
            required
            autoFocus
          />

          <div className="flex gap-3">
            <input
              type="number"
              className="w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Calories (opt)"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              min="0"
              max="9999"
            />
            <input
              type="time"
              className="w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm"
          >
            Log Meal 🍽️
          </button>
        </form>
      </div>
    </div>
  )
}
