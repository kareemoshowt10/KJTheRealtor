import { useState, useEffect, useRef } from 'react'
import { Plus, X, Check, Target } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'

export default function ObjectiveCard({ date }) {
  const { getDailyRecord, updateObjective } = useStore()
  const record = getDailyRecord(date)
  const { mainObjective, keyActions } = record.objective

  const [draft, setDraft] = useState(mainObjective)
  const [newAction, setNewAction] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => { setDraft(mainObjective) }, [date])

  function commitObjective(value) {
    updateObjective(date, { mainObjective: value })
  }

  function onDraftChange(value) {
    setDraft(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => commitObjective(value), 500)
  }

  function addAction(e) {
    e.preventDefault()
    if (!newAction.trim()) return
    updateObjective(date, {
      keyActions: [...keyActions, { id: makeId(), text: newAction.trim(), done: false }],
    })
    setNewAction('')
  }

  function toggleAction(id) {
    updateObjective(date, {
      keyActions: keyActions.map(a => a.id === id ? { ...a, done: !a.done } : a),
    })
  }

  function removeAction(id) {
    updateObjective(date, { keyActions: keyActions.filter(a => a.id !== id) })
  }

  const doneCount = keyActions.filter(a => a.done).length

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Target size={18} />
        <p className="font-bold text-sm uppercase tracking-wide opacity-90">Today's Main Objective</p>
      </div>
      <p className="text-xs opacity-70 mb-3">The one thing that, if completed, makes everything else easier or unnecessary.</p>

      <textarea
        className="w-full bg-white/15 placeholder-white/50 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white/20 resize-none"
        placeholder="What's your objective today?"
        rows={2}
        value={draft}
        onChange={e => onDraftChange(e.target.value)}
        onBlur={() => commitObjective(draft)}
      />

      {keyActions.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {keyActions.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-2.5 py-1.5">
              <button onClick={() => toggleAction(a.id)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  a.done ? 'bg-white border-white' : 'border-white/50'
                }`}>
                {a.done && <Check size={12} className="text-indigo-700" strokeWidth={3} />}
              </button>
              <span className={`text-sm flex-1 ${a.done ? 'line-through opacity-50' : ''}`}>{a.text}</span>
              <button onClick={() => removeAction(a.id)} className="text-white/40 hover:text-white/80">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addAction} className="flex items-center gap-2 mt-3">
        <input
          className="flex-1 bg-white/15 placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white/20"
          placeholder="Add a key action..."
          value={newAction}
          onChange={e => setNewAction(e.target.value)}
        />
        <button type="submit" className="bg-white/20 rounded-lg p-2 hover:bg-white/30">
          <Plus size={16} />
        </button>
      </form>

      {keyActions.length > 0 && (
        <p className="text-xs opacity-70 mt-2 text-right">{doneCount}/{keyActions.length} key actions done</p>
      )}
    </div>
  )
}
