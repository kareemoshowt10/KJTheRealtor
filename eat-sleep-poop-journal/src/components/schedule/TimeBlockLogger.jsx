import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'

export default function TimeBlockLogger({ onClose, date, existing }) {
  const { addEntry, updateEntry } = useStore()
  const [time, setTime] = useState(existing?.time || new Date().toTimeString().slice(0, 5))
  const [task, setTask] = useState(existing?.task || '')
  const [location, setLocation] = useState(existing?.location || '')
  const [subject, setSubject] = useState(existing?.subject || '')
  const [lesson, setLesson] = useState(existing?.lesson || '')
  const [cta, setCta] = useState(existing?.cta || '')

  function submit(e) {
    e.preventDefault()
    if (!task.trim() && !subject.trim()) return
    const payload = {
      type: 'timeblock', date, time,
      task: task.trim(), location: location.trim(),
      subject: subject.trim(), lesson: lesson.trim(), cta: cta.trim(),
    }
    if (existing) {
      updateEntry(existing.id, payload)
    } else {
      addEntry({ id: makeId(), ...payload })
    }
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
            <span className="text-2xl">🗓️</span>
            <h2 className="text-xl font-bold">{existing ? 'Edit' : 'Add'} Time Block</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="time"
              className="w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
            <input
              className="w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Location (1 word)"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">WHAT IS YOUR TASK?</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Planned task..."
              value={task}
              onChange={e => setTask(e.target.value)}
              autoFocus
            />
          </div>

          <div className="h-px bg-gray-100" />
          <p className="text-xs text-gray-400 font-medium -mb-2">RETROSPECTIVE — fill in after the block happens</p>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">SUBJECT <span className="font-normal text-gray-400">(and then this happened)</span></label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              rows={2}
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">LESSON <span className="font-normal text-gray-400">(but then this happened as a result)</span></label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              rows={2}
              value={lesson}
              onChange={e => setLesson(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">CTA <span className="font-normal text-gray-400">(do this now)</span></label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={cta}
              onChange={e => setCta(e.target.value)}
            />
          </div>

          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            {existing ? 'Save Changes' : 'Add Block'}
          </button>
        </form>
      </div>
    </div>
  )
}
