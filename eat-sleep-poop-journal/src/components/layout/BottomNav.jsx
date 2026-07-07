import { Home, CalendarClock, ListChecks, Moon, BarChart2 } from 'lucide-react'

const tabs = [
  { id: 'dashboard', icon: Home,          label: 'Today' },
  { id: 'schedule',  icon: CalendarClock, label: 'Schedule' },
  { id: 'track',     icon: ListChecks,    label: 'Track' },
  { id: 'reflect',   icon: Moon,          label: 'Reflect' },
  { id: 'insights',  icon: BarChart2,     label: 'Insights' },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-40"
         style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-violet-600' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
