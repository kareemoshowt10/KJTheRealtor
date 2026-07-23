import { Check, ShieldOff } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { calcHabitScore } from '../../utils/scoring'

export default function AvoidanceList({ date }) {
  const { state, getDailyRecord, toggleHabit } = useStore()
  const { habitList } = state.settings
  const record = getDailyRecord(date)
  const score = calcHabitScore(record.habits, habitList)

  if (!habitList.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldOff size={18} className="text-red-500" />
          <p className="font-bold text-gray-900">Avoidance List</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
          {score.avoided}/{score.total} avoided
        </span>
      </div>
      <div className="space-y-2">
        {habitList.map(h => {
          const done = !!record.habits[h.id]
          return (
            <button
              key={h.id}
              onClick={() => toggleHabit(date, h.id)}
              className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                done ? 'bg-red-500 border-red-500' : 'border-gray-300'
              }`}>
                {done && <Check size={14} className="text-white" strokeWidth={3} />}
              </span>
              <span className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {h.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
