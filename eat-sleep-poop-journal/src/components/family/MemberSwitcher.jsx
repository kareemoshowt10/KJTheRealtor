import MemberAvatar from './MemberAvatar'
import { memberColor } from '../../utils/memberUtils'

export default function MemberSwitcher({ members, activeId, onSelect }) {
  if (members.length <= 1) return null
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {members.map(m => {
        const isActive = m.id === activeId
        const color = memberColor(m)
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 whitespace-nowrap transition-all active:scale-95 ${
              isActive ? `${color.soft} font-semibold` : 'bg-gray-100 text-gray-500'
            }`}
          >
            <MemberAvatar member={m} size="sm" />
            <span className="text-sm">{m.name}</span>
          </button>
        )
      })}
    </div>
  )
}
