import { memberColor } from '../../utils/memberUtils'

const SIZES = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-lg',
  lg: 'w-12 h-12 text-2xl',
}

export default function MemberAvatar({ member, size = 'md', active = false }) {
  const color = memberColor(member)
  return (
    <span className={`${SIZES[size]} ${color.soft} rounded-full flex items-center justify-center shrink-0 transition-all ${
      active ? `ring-2 ${color.ring} ring-offset-1` : ''
    }`}>
      {member?.emoji || '😀'}
    </span>
  )
}
