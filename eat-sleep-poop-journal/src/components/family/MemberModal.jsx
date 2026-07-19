import { useState } from 'react'
import { X } from 'lucide-react'
import { MEMBER_EMOJIS, COLOR_KEYS, MEMBER_COLORS } from '../../utils/memberUtils'

export default function MemberModal({ existing, onSave, onClose }) {
  const [name, setName] = useState(existing?.name || '')
  const [emoji, setEmoji] = useState(existing?.emoji || '👦')
  const [color, setColor] = useState(existing?.color || 'sky')
  const [role, setRole] = useState(existing?.role || 'child')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), emoji, color, role })
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
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${MEMBER_COLORS[color].soft}`}>{emoji}</span>
            <h2 className="text-xl font-bold">{existing ? 'Edit' : 'Add'} Family Member</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="Name *"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex gap-2">
            {[
              { id: 'adult', label: '🧑 Adult' },
              { id: 'child', label: '🧒 Kid' },
            ].map(r => (
              <button key={r.id} type="button" onClick={() => setRole(r.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  role === r.id ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">AVATAR</p>
            <div className="grid grid-cols-8 gap-1.5">
              {MEMBER_EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-violet-100 ring-2 ring-violet-400 scale-105' : 'bg-gray-50'
                  }`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">COLOR</p>
            <div className="flex gap-2 flex-wrap">
              {COLOR_KEYS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full ${MEMBER_COLORS[c].solid} transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : ''
                  }`} />
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-sm">
            {existing ? 'Save Changes' : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  )
}
