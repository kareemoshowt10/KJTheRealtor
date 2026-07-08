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
              className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1 text-xs font-medium transition-colors active:scale-95 ${
                isActive ? 'text-violet-600' : 'text-gray-400'
              }`}
            >
              <span className={`flex items-center justify-center w-9 h-7 rounded-full transition-colors duration-200 ${
                isActive ? 'bg-violet-50' : ''
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
