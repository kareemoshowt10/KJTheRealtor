import { useState, useMemo } from 'react'
import { Plus, MapPin, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useStore } from '../store/useStore'
import TimeBlockLogger from '../components/schedule/TimeBlockLogger'

function BlockCard({ block, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-blue-400 mb-2.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onEdit(block)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onEdit(block) }}
        className="w-full text-left px-4 py-3 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 rounded-lg px-2 py-1 shrink-0 mt-0.5">
            {block.time}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">{block.task || <span className="text-gray-400 italic">No task set</span>}</p>
            {block.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {block.location}
              </p>
            )}
            {block.subject && (
              <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 rounded-lg px-2 py-1.5">
                <span className="font-medium">What happened:</span> {block.subject}
              </p>
            )}
            {block.lesson && (
              <p className="text-xs text-gray-600 mt-1 bg-amber-50 rounded-lg px-2 py-1.5">
                <span className="font-medium">Lesson:</span> {block.lesson}
              </p>
            )}
            {block.cta && (
              <p className="text-xs text-white bg-blue-500 rounded-lg px-2 py-1.5 mt-1 font-medium">
                → {block.cta}
              </p>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(block.id) }} className="p-1 text-red-300 hover:text-red-500 shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Schedule() {
  const { state, deleteEntry } = useStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [modalBlock, setModalBlock] = useState(undefined) // undefined = closed, null = new, obj = edit

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')

  const blocks = useMemo(() =>
    state.entries
      .filter(e => e.type === 'timeblock' && e.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  , [state.entries, dateStr])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => setSelectedDate(d => addDays(d, -1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <span className="font-medium text-sm text-gray-700">
            {isToday ? 'Today' : format(selectedDate, 'EEE, MMM d')}
          </span>
          <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Time Blocks</p>
          <button onClick={() => setModalBlock(null)}
            className="flex items-center gap-1 text-blue-600 text-sm font-semibold bg-blue-50 rounded-full px-3 py-1.5">
            <Plus size={14} /> Add Block
          </button>
        </div>

        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="text-gray-500 font-medium">No time blocks yet</p>
            <p className="text-gray-400 text-sm mt-1">Plan your day, then fill in what happened</p>
          </div>
        ) : blocks.map(b => (
          <BlockCard key={b.id} block={b} onEdit={setModalBlock} onDelete={deleteEntry} />
        ))}
      </div>

      {modalBlock !== undefined && (
        <TimeBlockLogger
          date={dateStr}
          existing={modalBlock}
          onClose={() => setModalBlock(undefined)}
        />
      )}
    </div>
  )
}
