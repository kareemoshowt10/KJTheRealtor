import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, makeId } from '../../store/useStore'
import { useToast } from '../../store/ToastContext'
import { toISOString } from '../../utils/dateUtils'
import { getMember } from '../../utils/memberUtils'
import LoggerMemberPicker from '../family/LoggerMemberPicker'

const AMOUNTS = [
  { id: 'Light', label: 'Light', drops: '💧' },
  { id: 'Medium', label: 'Medium', drops: '💧💧' },
  { id: 'Heavy', label: 'Heavy', drops: '💧💧💧' },
]

const COLORS = ['Clear', 'Pale Yellow', 'Yellow', 'Dark Yellow']

export default function PeeLogger({ onClose, existing }) {
  const { state, addEntry, updateEntry } = useStore()
  const { showToast } = useToast()
  const { members, activeMemberId } = state.settings
  const [memberId, setMemberId] = useState(existing?.memberId || activeMemberId)
  const [amount, setAmount] = useState(existing?.amount || 'Medium')
  const [color, setColor] = useState(existing?.color || 'Pale Yellow')
  const [accident, setAccident] = useState(existing?.accident || false)
  const [notes, setNotes] = useState(existing?.notes || '')
  const [time, setTime] = useState(
    existing ? new Date(existing.timestamp).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5)
  )

  function submit(e) {
    e.preventDefault()
    const base = existing ? new Date(existing.timestamp) : new Date()
    const [h, m] = time.split(':')
    base.setHours(+h, +m, 0, 0)
    const payload = {
      type: 'pee', timestamp: toISOString(base), memberId,
      amount, color, accident, notes: notes.trim(),
    }
    if (existing) {
      updateEntry(existing.id, payload)
      showToast('Pee updated 💧')
    } else {
      addEntry({ id: makeId(), ...payload })
      const member = getMember(members, memberId)
      showToast(members.length > 1 ? `Pee logged for ${member.name} 💧` : 'Pee logged 💧')
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
            <span className="text-2xl">💧</span>
            <h2 className="text-xl font-bold">{existing ? 'Edit' : 'Log'} Pee</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <LoggerMemberPicker members={members} value={memberId} onChange={setMemberId} />

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">AMOUNT</label>
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map(a => (
                <button key={a.id} type="button" onClick={() => setAmount(a.id)}
                  className={`flex flex-col items-center py-3 rounded-xl transition-all ${
                    amount === a.id ? 'bg-cyan-500 text-white shadow-sm scale-105' : 'bg-gray-100 text-gray-600'
                  }`}>
                  <span className="text-lg">{a.drops}</span>
                  <span className="text-xs mt-0.5 font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">COLOR</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    color === c ? 'bg-cyan-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setAccident(a => !a)}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
              accident ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'
            }`}>
            <span className="text-sm font-medium">🚼 Accident / off potty</span>
            <span className={`w-11 h-6 rounded-full relative transition-colors ${accident ? 'bg-amber-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${accident ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </span>
          </button>

          <input
            type="time"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 resize-none"
            placeholder="Notes (optional)"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            {existing ? 'Save Changes' : 'Log Pee'} 💧
          </button>
        </form>
      </div>
    </div>
  )
}
