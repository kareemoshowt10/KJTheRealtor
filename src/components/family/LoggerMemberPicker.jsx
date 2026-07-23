import { memberColor } from '../../utils/memberUtils'

export default function LoggerMemberPicker({ members, value, onChange }) {
  if (members.length <= 1) return null
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium mb-2">WHO IS THIS FOR?</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {members.map(m => {
          const isActive = m.id === value
          const color = memberColor(m)
          return (
            <button key={m.id} type="button" onClick={() => onChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive ? `${color.solid} text-white shadow-sm` : 'bg-gray-100 text-gray-600'
              }`}>
              <span>{m.emoji}</span> {m.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
