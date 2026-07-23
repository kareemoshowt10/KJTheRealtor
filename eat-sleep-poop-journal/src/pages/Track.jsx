import { useState, useMemo } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../store/useStore'
import { formatTime, getDurationLabel, isSameLocalDay } from '../utils/dateUtils'
import { getMember, entryMemberId } from '../utils/memberUtils'
import MemberSwitcher from '../components/family/MemberSwitcher'
import EatLogger from '../components/tracking/EatLogger'
import SleepLogger from '../components/tracking/SleepLogger'
import PoopLogger from '../components/tracking/PoopLogger'
import PeeLogger from '../components/tracking/PeeLogger'
import MindSessionLogger from '../components/bodymind/MindSessionLogger'
import ExerciseLogger from '../components/bodymind/ExerciseLogger'
import MeasureLogger from '../components/bodymind/MeasureLogger'
import ContactLogger from '../components/contacts/ContactLogger'

const TILES = [
  { id: 'eat', emoji: '🍽️', label: 'Eat', color: 'bg-orange-500' },
  { id: 'sleep', emoji: '😴', label: 'Sleep', color: 'bg-violet-600' },
  { id: 'poop', emoji: '💩', label: 'Poop', color: 'bg-amber-500' },
  { id: 'pee', emoji: '💧', label: 'Pee', color: 'bg-cyan-500' },
  { id: 'measurement', emoji: '📏', label: 'Growth', color: 'bg-emerald-600' },
  { id: 'meditation', emoji: '🧘', label: 'Meditate', color: 'bg-teal-500' },
  { id: 'reading', emoji: '📖', label: 'Read', color: 'bg-sky-500' },
  { id: 'exercise', emoji: '💪', label: 'Exercise', color: 'bg-lime-600' },
  { id: 'contact', emoji: '📇', label: 'Contact', color: 'bg-rose-500' },
]

function RecentEntry({ entry }) {
  const time = formatTime(entry.timestamp || entry.startTime)
  const rows = {
    eat: () => ({ icon: '🍽️', title: entry.food, sub: `${entry.mealType}${entry.calories ? ` · ${entry.calories} cal` : ''}` }),
    sleep: () => ({ icon: '😴', title: `${getDurationLabel(entry.startTime, entry.endTime)} of sleep`, sub: `Quality: ${'⭐'.repeat(entry.quality)}` }),
    poop: () => ({ icon: '💩', title: `Bristol Type ${entry.bristolType}`, sub: entry.color }),
    pee: () => ({ icon: '💧', title: `${entry.amount} pee`, sub: [entry.color, entry.accident ? 'accident' : null].filter(Boolean).join(' · ') }),
    measurement: () => ({ icon: '📏', title: `${entry.value} ${entry.unit}`, sub: entry.measureType === 'weight' ? 'Weight' : 'Height' }),
    meditation: () => ({ icon: '🧘', title: `${entry.durationMin} min meditation`, sub: entry.notes || 'No notes' }),
    reading: () => ({ icon: '📖', title: `${entry.durationMin} min reading`, sub: entry.notes || 'No notes' }),
    exercise: () => ({ icon: '💪', title: entry.exercise, sub: [entry.count, entry.durationLocation].filter(Boolean).join(' · ') || 'Logged' }),
    contact: () => ({ icon: '📇', title: entry.name, sub: entry.subject || 'No subject' }),
  }
  const row = rows[entry.type]?.()
  if (!row) return null
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xl">{row.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{row.title}</p>
        <p className="text-xs text-gray-400 truncate">{row.sub}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{time}</span>
    </div>
  )
}

const FAMILY_TILE_IDS = ['eat', 'sleep', 'poop', 'pee', 'measurement']

export default function Track({ onNavigate }) {
  const { state, setActiveMember } = useStore()
  const [modal, setModal] = useState(null)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const { members, activeMemberId } = state.settings
  const activeMember = getMember(members, activeMemberId)
  const isChildView = activeMember.role === 'child'
  const tiles = isChildView ? TILES.filter(t => FAMILY_TILE_IDS.includes(t.id)) : TILES

  const todayEntries = useMemo(() =>
    state.entries
      .filter(e => e.type !== 'timeblock' &&
        entryMemberId(e) === activeMember.id &&
        isSameLocalDay(e.timestamp || e.startTime, todayStr))
      .sort((a, b) => new Date(b.timestamp || b.startTime) - new Date(a.timestamp || a.startTime))
  , [state.entries, activeMember.id, todayStr])

  const totalCalories = useMemo(() =>
    todayEntries.filter(e => e.type === 'eat' && e.calories).reduce((sum, e) => sum + e.calories, 0)
  , [todayEntries])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Track</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {isChildView ? `Tracking for ${activeMember.name}` : 'Body, mind & relationships'}
            </p>
          </div>
          <button onClick={() => onNavigate('history')} className="flex items-center gap-1 text-gray-500 text-sm font-medium active:scale-95 transition-transform">
            <Clock size={16} /> History <ChevronRight size={14} />
          </button>
        </div>
        {members.length > 1 && (
          <div className="mt-3">
            <MemberSwitcher members={members} activeId={activeMemberId} onSelect={setActiveMember} />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-4 space-y-5">
        <div className={`grid gap-2.5 ${isChildView ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {tiles.map(t => (
            <button key={t.id} onClick={() => setModal(t.id)}
              className={`${t.color} text-white rounded-2xl py-4 flex flex-col items-center gap-1.5 active:scale-95 transition-transform shadow-sm`}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-semibold text-xs">{t.label}</span>
            </button>
          ))}
        </div>

        {totalCalories > 0 && (
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Today's Calories</span>
            <span className="text-xl font-bold text-orange-600">{totalCalories} cal</span>
          </div>
        )}

        {todayEntries.length > 0 ? (
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
              {members.length > 1 && activeMember.name !== 'Me' ? `${activeMember.name}'s Log Today` : "Today's Log"}
            </p>
            <div className="bg-white rounded-2xl px-4 shadow-sm divide-y divide-gray-50">
              {todayEntries.map(e => <RecentEntry key={e.id} entry={e} />)}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">
              {members.length > 1 && activeMember.name !== 'Me' ? `Nothing tracked for ${activeMember.name} today` : 'Nothing tracked yet today'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Tap a tile above to log something</p>
          </div>
        )}
      </div>

      {modal === 'eat' && <EatLogger onClose={() => setModal(null)} />}
      {modal === 'sleep' && <SleepLogger onClose={() => setModal(null)} />}
      {modal === 'poop' && <PoopLogger onClose={() => setModal(null)} />}
      {modal === 'pee' && <PeeLogger onClose={() => setModal(null)} />}
      {modal === 'measurement' && <MeasureLogger onClose={() => setModal(null)} />}
      {modal === 'meditation' && <MindSessionLogger type="meditation" onClose={() => setModal(null)} />}
      {modal === 'reading' && <MindSessionLogger type="reading" onClose={() => setModal(null)} />}
      {modal === 'exercise' && <ExerciseLogger onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactLogger onClose={() => setModal(null)} />}
    </div>
  )
}
