import { useState, useMemo } from 'react'
import { Trash2, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatTime, groupByDay, getDurationLabel } from '../utils/dateUtils'
import { entryMemberId, memberColor } from '../utils/memberUtils'
import UndoToast from '../components/common/UndoToast'

function EntryCard({ entry, member, showMember, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const time = formatTime(entry.timestamp || entry.startTime)

  let icon, title, subtitle, detail, accentColor

  if (entry.type === 'eat') {
    icon = '🍽️'; accentColor = 'border-l-orange-400'
    title = entry.food; subtitle = `${entry.mealType}${entry.calories ? ` · ${entry.calories} cal` : ''}`
    detail = entry.notes
  } else if (entry.type === 'sleep') {
    icon = '😴'; accentColor = 'border-l-violet-400'
    const dur = getDurationLabel(entry.startTime, entry.endTime)
    title = `${dur} of sleep`
    subtitle = `${'⭐'.repeat(entry.quality)} · Woke at ${time}`
    detail = entry.notes
  } else if (entry.type === 'poop') {
    icon = '💩'; accentColor = 'border-l-amber-400'
    title = `Bristol Type ${entry.bristolType}`
    subtitle = entry.color
    detail = entry.notes
  } else if (entry.type === 'meditation') {
    icon = '🧘'; accentColor = 'border-l-teal-400'
    title = `${entry.durationMin} min meditation`
    subtitle = 'Body & Mind'
    detail = entry.notes
  } else if (entry.type === 'reading') {
    icon = '📖'; accentColor = 'border-l-sky-400'
    title = `${entry.durationMin} min reading`
    subtitle = 'Body & Mind'
    detail = entry.notes
  } else if (entry.type === 'exercise') {
    icon = '💪'; accentColor = 'border-l-lime-500'
    title = entry.exercise
    subtitle = [entry.count, entry.durationLocation].filter(Boolean).join(' · ') || 'Exercise'
    detail = entry.notes
  } else if (entry.type === 'contact') {
    icon = '📇'; accentColor = 'border-l-rose-400'
    title = entry.name
    subtitle = entry.subject || 'Contact'
    detail = entry.description
  }

  if (!icon) return null

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${accentColor} mb-2.5 animate-fade-in`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {showMember && member && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 mr-1.5 text-[10px] font-semibold ${memberColor(member).soft}`}>
                {member.emoji} {member.name}
              </span>
            )}
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{time}</span>
          {detail && (
            <button onClick={() => setExpanded(x => !x)} className="p-1 text-gray-300 hover:text-gray-500 active:scale-90 transition-transform">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button onClick={() => onDelete(entry.id)} className="p-1 text-red-300 hover:text-red-500 active:scale-90 transition-transform">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {expanded && detail && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{detail}</p>
        </div>
      )}
    </div>
  )
}

export default function History({ onNavigate }) {
  const { state, addEntry, deleteEntry } = useStore()
  const [filter, setFilter] = useState('all')
  const [memberFilter, setMemberFilter] = useState('all')
  const [deletedEntry, setDeletedEntry] = useState(null)
  const { members } = state.settings
  const membersById = useMemo(() =>
    Object.fromEntries(members.map(m => [m.id, m]))
  , [members])

  function handleDelete(id) {
    const entry = state.entries.find(e => e.id === id)
    deleteEntry(id)
    if (entry) setDeletedEntry(entry)
  }

  function undoDelete() {
    if (deletedEntry) addEntry(deletedEntry)
    setDeletedEntry(null)
  }

  const loggableEntries = useMemo(() =>
    state.entries.filter(e => e.type !== 'timeblock')
  , [state.entries])

  const groups = useMemo(() => {
    let filtered = filter === 'all'
      ? loggableEntries
      : loggableEntries.filter(e => e.type === filter)
    if (memberFilter !== 'all') {
      filtered = filtered.filter(e => entryMemberId(e) === memberFilter)
    }
    return groupByDay(filtered)
  }, [loggableEntries, filter, memberFilter])

  const filters = [
    { id: 'all',        emoji: '📋', label: 'All' },
    { id: 'eat',        emoji: '🍽️', label: 'Eat' },
    { id: 'sleep',      emoji: '😴', label: 'Sleep' },
    { id: 'poop',       emoji: '💩', label: 'Poop' },
    { id: 'meditation', emoji: '🧘', label: 'Meditate' },
    { id: 'reading',    emoji: '📖', label: 'Read' },
    { id: 'exercise',   emoji: '💪', label: 'Exercise' },
    { id: 'contact',    emoji: '📇', label: 'Contacts' },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => onNavigate('track')} className="p-1 -ml-1 rounded-full hover:bg-gray-100 active:scale-90 transition-transform">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-2xl font-bold">History</h1>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                filter === f.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{f.emoji}</span> {f.label}
            </button>
          ))}
        </div>
        {members.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => setMemberFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                memberFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
              👨‍👩‍👧‍👦 Everyone
            </button>
            {members.map(m => (
              <button key={m.id} onClick={() => setMemberFilter(m.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  memberFilter === m.id ? `${memberColor(m).solid} text-white` : 'bg-gray-100 text-gray-600'
                }`}>
                {m.emoji} {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-4">
        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🗒️</div>
            <p className="text-gray-500 font-medium">No entries yet</p>
            <p className="text-gray-400 text-sm mt-1">Start logging from the Track tab</p>
          </div>
        ) : groups.map(({ day, label, items }) => (
          <div key={day} className="mb-5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2.5">{label}</p>
            {items
              .sort((a, b) => new Date(b.timestamp || b.startTime) - new Date(a.timestamp || a.startTime))
              .map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  member={membersById[entryMemberId(entry)]}
                  showMember={members.length > 1 && memberFilter === 'all'}
                  onDelete={handleDelete}
                />
              ))
            }
          </div>
        ))}
      </div>

      {deletedEntry && (
        <UndoToast
          message="Entry deleted"
          onUndo={undoDelete}
          onDismiss={() => setDeletedEntry(null)}
        />
      )}
    </div>
  )
}
