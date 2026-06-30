import { useState, useMemo } from 'react'
import { Plus, Flame, Utensils, Moon, Waves } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../store/useStore'
import { formatTime, getStreaks } from '../utils/dateUtils'
import EatLogger from '../components/tracking/EatLogger'
import SleepLogger from '../components/tracking/SleepLogger'
import PoopLogger from '../components/tracking/PoopLogger'

function QuickStat({ emoji, label, value, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-1 rounded-2xl p-4 text-left active:scale-95 transition-transform ${color}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-70 mt-0.5">{label}</div>
    </button>
  )
}

function RecentEntry({ entry }) {
  const time = formatTime(entry.timestamp || entry.startTime)
  if (entry.type === 'eat') return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xl">🍽️</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{entry.food}</p>
        <p className="text-xs text-gray-400">{entry.mealType}{entry.calories ? ` · ${entry.calories} cal` : ''}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{time}</span>
    </div>
  )
  if (entry.type === 'sleep') {
    const dur = ((new Date(entry.endTime) - new Date(entry.startTime)) / 3600000).toFixed(1)
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-xl">😴</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{dur}h of sleep</p>
          <p className="text-xs text-gray-400">Quality: {'⭐'.repeat(entry.quality)}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{time}</span>
      </div>
    )
  }
  if (entry.type === 'poop') return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xl">💩</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">Bristol Type {entry.bristolType}</p>
        <p className="text-xs text-gray-400">{entry.color}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{time}</span>
    </div>
  )
  return null
}

export default function Dashboard() {
  const { state } = useStore()
  const [modal, setModal] = useState(null) // 'eat' | 'sleep' | 'poop'

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const todayEntries = useMemo(() =>
    state.entries.filter(e => {
      const ts = e.timestamp || e.startTime
      return ts && ts.startsWith(todayStr)
    }).sort((a, b) => new Date(b.timestamp || b.startTime) - new Date(a.timestamp || a.startTime))
  , [state.entries, todayStr])

  const todayEat   = todayEntries.filter(e => e.type === 'eat').length
  const todaySleep = todayEntries.filter(e => e.type === 'sleep')
  const todayPoop  = todayEntries.filter(e => e.type === 'poop').length
  const sleepHours = todaySleep.reduce((acc, e) =>
    acc + (new Date(e.endTime) - new Date(e.startTime)) / 3600000, 0)

  const eatStreak   = getStreaks(state.entries, 'eat')
  const sleepStreak = getStreaks(state.entries, 'sleep')
  const poopStreak  = getStreaks(state.entries, 'poop')

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const name = state.settings?.name

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <p className="text-gray-400 text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h1 className="text-2xl font-bold mt-0.5">
          {greeting()}{name ? `, ${name}` : ''}! 👋
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-5 pt-5">

        {/* Quick stats */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Today's Overview</p>
          <div className="flex gap-3">
            <QuickStat emoji="🍽️" label={`meal${todayEat !== 1 ? 's' : ''}`} value={todayEat}
              color="bg-orange-50 text-orange-900" onClick={() => setModal('eat')} />
            <QuickStat emoji="😴" label="hrs sleep" value={sleepHours > 0 ? sleepHours.toFixed(1) : '—'}
              color="bg-violet-50 text-violet-900" onClick={() => setModal('sleep')} />
            <QuickStat emoji="💩" label={`poop${todayPoop !== 1 ? 's' : ''}`} value={todayPoop}
              color="bg-amber-50 text-amber-900" onClick={() => setModal('poop')} />
          </div>
        </div>

        {/* Streaks */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">🔥 Streaks</p>
          <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-gray-100">
            {[
              { emoji: '🍽️', label: 'Eat', streak: eatStreak },
              { emoji: '😴', label: 'Sleep', streak: sleepStreak },
              { emoji: '💩', label: 'Poop', streak: poopStreak },
            ].map(({ emoji, label, streak }) => (
              <div key={label} className="flex flex-col items-center py-1">
                <span className="text-xl">{emoji}</span>
                <span className="text-2xl font-bold mt-1">{streak}</span>
                <span className="text-xs text-gray-400">day{streak !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Quick Log</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setModal('eat')}
              className="bg-orange-500 text-white rounded-2xl py-5 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-sm">
              <span className="text-3xl">🍽️</span>
              <span className="font-bold text-sm">Eat</span>
            </button>
            <button onClick={() => setModal('sleep')}
              className="bg-violet-600 text-white rounded-2xl py-5 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-sm">
              <span className="text-3xl">😴</span>
              <span className="font-bold text-sm">Sleep</span>
            </button>
            <button onClick={() => setModal('poop')}
              className="bg-amber-500 text-white rounded-2xl py-5 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-sm">
              <span className="text-3xl">💩</span>
              <span className="font-bold text-sm">Poop</span>
            </button>
          </div>
        </div>

        {/* Recent entries */}
        {todayEntries.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Today's Log</p>
            <div className="bg-white rounded-2xl px-4 shadow-sm divide-y divide-gray-50">
              {todayEntries.slice(0, 8).map(e => <RecentEntry key={e.id} entry={e} />)}
            </div>
          </div>
        )}

        {todayEntries.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Nothing logged yet today</p>
            <p className="text-gray-400 text-sm mt-1">Tap a button above to get started!</p>
          </div>
        )}
      </div>

      {modal === 'eat'   && <EatLogger   onClose={() => setModal(null)} />}
      {modal === 'sleep' && <SleepLogger onClose={() => setModal(null)} />}
      {modal === 'poop'  && <PoopLogger  onClose={() => setModal(null)} />}
    </div>
  )
}
