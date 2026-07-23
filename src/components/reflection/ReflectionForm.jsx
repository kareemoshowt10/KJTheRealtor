import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { calcReflectionAP } from '../../utils/scoring'

const CORE_PROMPTS = [
  { key: 'mind', label: "Where's my mind today?" },
  { key: 'feeling', label: 'How do I feel today?' },
  { key: 'reframe', label: 'How can I reframe urges that do not serve me?' },
]

const EXTRA_PROMPTS = [
  { key: 'special', label: 'EXTRA — What makes you special?' },
  { key: 'lesson', label: 'EXTRA — What\'s the most important thing you learned today?' },
]

function PromptField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium block mb-1.5">{label}</label>
      <textarea
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
        rows={2}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export default function ReflectionForm({ date }) {
  const { getDailyRecord, updateReflection } = useStore()
  const record = getDailyRecord(date)
  const [draft, setDraft] = useState(record.reflection)
  const debounceRef = useRef(null)

  useEffect(() => { setDraft(record.reflection) }, [date])

  function setField(key, value) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateReflection(date, { [key]: value }), 500)
  }

  const ap = calcReflectionAP(draft)

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-4 text-white flex items-center justify-between">
        <div>
          <p className="font-bold text-sm uppercase tracking-wide opacity-90">Awareness Points Earned</p>
          <p className="text-xs opacity-70 mt-0.5">Core questions: {ap.core}/{ap.maxCore} · Extra: {ap.extra}/{ap.maxExtra}</p>
        </div>
        <div className="text-right flex items-center gap-1">
          <Sparkles size={20} />
          <span className="text-3xl font-bold">{ap.total}</span>
          <span className="text-sm opacity-70">/{ap.max}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Review My Day & My Character</p>
        {CORE_PROMPTS.map(p => (
          <PromptField key={p.key} label={p.label} value={draft[p.key]} onChange={v => setField(p.key, v)} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Extra Questions — Double Points</p>
        {EXTRA_PROMPTS.map(p => (
          <PromptField key={p.key} label={p.label} value={draft[p.key]} onChange={v => setField(p.key, v)} />
        ))}
      </div>
    </div>
  )
}
