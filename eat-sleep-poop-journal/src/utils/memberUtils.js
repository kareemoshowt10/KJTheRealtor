export const MEMBER_COLORS = {
  violet:  { solid: 'bg-violet-500',  soft: 'bg-violet-100 text-violet-700',   ring: 'ring-violet-500',  text: 'text-violet-600' },
  orange:  { solid: 'bg-orange-500',  soft: 'bg-orange-100 text-orange-700',   ring: 'ring-orange-500',  text: 'text-orange-600' },
  teal:    { solid: 'bg-teal-500',    soft: 'bg-teal-100 text-teal-700',       ring: 'ring-teal-500',    text: 'text-teal-600' },
  rose:    { solid: 'bg-rose-500',    soft: 'bg-rose-100 text-rose-700',       ring: 'ring-rose-500',    text: 'text-rose-600' },
  sky:     { solid: 'bg-sky-500',     soft: 'bg-sky-100 text-sky-700',         ring: 'ring-sky-500',     text: 'text-sky-600' },
  amber:   { solid: 'bg-amber-500',   soft: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-500',   text: 'text-amber-600' },
  lime:    { solid: 'bg-lime-600',    soft: 'bg-lime-100 text-lime-700',       ring: 'ring-lime-600',    text: 'text-lime-700' },
  fuchsia: { solid: 'bg-fuchsia-500', soft: 'bg-fuchsia-100 text-fuchsia-700', ring: 'ring-fuchsia-500', text: 'text-fuchsia-600' },
}

export const COLOR_KEYS = Object.keys(MEMBER_COLORS)

export const MEMBER_EMOJIS = ['😀', '😎', '🧔', '👩', '👦', '👧', '👶', '🐣', '🐻', '🦁', '🦄', '🚀', '🌟', '🐸', '🐯', '🦖']

export function memberColor(member) {
  return MEMBER_COLORS[member?.color] || MEMBER_COLORS.violet
}

export function getMember(members, id) {
  return members.find(m => m.id === id) || members[0]
}

// Entries logged before family profiles existed carry no memberId — they belong to the owner.
export function entryMemberId(entry, ownerId = 'me') {
  return entry.memberId || ownerId
}
