import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { useToast } from '../../store/ToastContext'
import { toISOString } from '../../utils/dateUtils'
import { getMember } from '../../utils/memberUtils'
import LoggerMemberPicker from '../family/LoggerMemberPicker'

const UNITS = {
  weight: ['lb', 'kg'],
  height: ['in', 'cm'],
}

export default function MeasureLogger({ onClose, existing }) {
  const { state, addEntry, updateEntry } = useStore()
  const { showToast } = useToast()
  const { members, activeMemberId } = state.settings
  const [memberId, setMemberId] = useState(existing?.memberId || activeMemberId)
  const [measureType, setMeasureType] = useState(existing?.measureType || 'weight')
  const [value, setValue] = useState(existing?.value != null ? String(existing.value) : '')
  const [unit, setUnit] = useState(existing?.unit || 'lb')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [date, setDate] = useState(
    existing ? new Date(existing.timestamp).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [error, setError] = useState('')

  function pickType(t) {
    setMeasureType(t)
    if (!UNITS[t].includes(unit)) setUnit(UNITS[t][0])
    setError('')
  }

  function submit(e) {
    e.preventDefault()
    const num = parseFloat(value)
    if (!num || num <= 0) {
      setError('Enter a valid measurement.')
      return
    }
    const base = existing ? new Date(existing.timestamp) : new Date()
    const [y, mo, d] = date.split('-')
    base.setFullYear(+y, +mo - 1, +d)
    const payload = {
      type: 'measurement', timestamp: toISOString(base), memberId,
      measureType, value: num, unit, notes: notes.trim(),
    }
    if (existing) {
      updateEntry(existing.id, payload)
      showToast('Measurement updated 📏')
    } else {
      addEntry({ id: makeId(), ...payload })
      const member = getMember(members, memberId)
      const label = measureType === 'weight' ? 'Weight' : 'Height'
      showToast(members.length > 1 ? `${label} logged for ${member.name} 📏` : `${label} logged 📏`)
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
            <span className="text-2xl">📏</span>
            <h2 className="text-xl font-bold">{existing ? 'Edit' : 'Log'} Measurement</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <LoggerMemberPicker members={members} value={memberId} onChange={setMemberId} />

          <div className="flex gap-2">
            {[
              { id: 'weight', label: '⚖️ Weight' },
              { id: 'height', label: '📐 Height' },
            ].map(t => (
              <button key={t.id} type="button" onClick={() => pickType(t.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  measureType === t.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder={measureType === 'weight' ? 'Weight' : 'Height'}
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              autoFocus
            />
            <div className="flex rounded-xl bg-gray-100 p-1">
              {UNITS[measureType].map(u => (
                <button key={u} type="button" onClick={() => setUnit(u)}
                  className={`px-4 rounded-lg text-sm font-semibold transition-all ${
                    unit === u ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
                  }`}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">DATE</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            {existing ? 'Save Changes' : 'Log Measurement'} 📏
          </button>
        </form>
      </div>
    </div>
  )
}
