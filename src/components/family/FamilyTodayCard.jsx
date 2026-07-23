import { Users, Plus, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../../store/useStore'
import { isSameLocalDay } from '../../utils/dateUtils'
import { entryMemberId, memberColor } from '../../utils/memberUtils'
import MemberAvatar from './MemberAvatar'

function MiniStat({ emoji, value }) {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-600">
      <span>{emoji}</span>
      <span className="font-semibold">{value}</span>
    </span>
  )
}

export default function FamilyTodayCard({ onNavigate }) {
  const { state, setActiveMember } = useStore()
  const { members, activeMemberId } = state.settings
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const todayFor = (memberId) => {
    const todays = state.entries.filter(e =>
      e.type !== 'timeblock' &&
      entryMemberId(e) === memberId &&
      isSameLocalDay(e.timestamp || e.startTime, todayStr)
    )
    const meals = todays.filter(e => e.type === 'eat').length
    const poops = todays.filter(e => e.type === 'poop').length
    const sleepH = todays.filter(e => e.type === 'sleep')
      .reduce((a, e) => a + (new Date(e.endTime) - new Date(e.startTime)) / 3600000, 0)
    return { meals, poops, sleepH }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-violet-600" />
          <p className="font-bold text-gray-900">Family Today</p>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-0.5 text-xs text-violet-600 font-semibold active:scale-95 transition-transform"
        >
          <Plus size={13} /> {members.length > 1 ? 'Manage' : 'Add family'}
        </button>
      </div>

      <div className="space-y-1">
        {members.map(m => {
          const s = todayFor(m.id)
          const isActive = m.id === activeMemberId
          const color = memberColor(m)
          return (
            <button
              key={m.id}
              onClick={() => setActiveMember(m.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all active:scale-[0.98] ${
                isActive ? color.soft.split(' ')[0] : ''
              }`}
            >
              <MemberAvatar member={m} active={isActive} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? '' : 'text-gray-700'}`}>
                  {m.name}
                  {m.role === 'child' && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 rounded px-1 py-0.5">kid</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <MiniStat emoji="🍽️" value={s.meals} />
                <MiniStat emoji="😴" value={s.sleepH > 0 ? `${s.sleepH.toFixed(1)}h` : '—'} />
                <MiniStat emoji="💩" value={s.poops} />
                {isActive && <ChevronRight size={14} className="text-gray-400" />}
              </div>
            </button>
          )
        })}
      </div>

      {members.length === 1 && (
        <p className="text-xs text-gray-400 mt-2 px-1">
          Add your kids or partner to track everyone's eat, sleep & poop in one place.
        </p>
      )}
    </div>
  )
}
