import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { useStore } from '../store/useStore'

function getLast7(entries, type, getValue) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const key = format(d, 'yyyy-MM-dd')
    const dayEntries = entries.filter(e =>
      e.type === type && (e.timestamp || e.startTime || '').startsWith(key)
    )
    return { day: format(d, 'EEE'), value: getValue(dayEntries) }
  })
  return days
}

function StatRow({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 text-sm">{label}</span>
      <div className="text-right">
        <span className="font-bold text-gray-900">{value}</span>
        {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

export default function Insights() {
  const { state } = useStore()
  const entries = state.entries

  const eatData = useMemo(() => getLast7(entries, 'eat', d => d.length), [entries])
  const sleepData = useMemo(() => getLast7(entries, 'sleep', d => {
    const total = d.reduce((s, e) => s + (new Date(e.endTime) - new Date(e.startTime)) / 3600000, 0)
    return +total.toFixed(1)
  }), [entries])
  const poopData = useMemo(() => getLast7(entries, 'poop', d => d.length), [entries])

  const avgSleep = useMemo(() => {
    const vals = sleepData.map(d => d.value).filter(v => v > 0)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
  }, [sleepData])

  const totalMeals = useMemo(() => eatData.reduce((a, b) => a + b.value, 0), [eatData])
  const totalPoops = useMemo(() => poopData.reduce((a, b) => a + b.value, 0), [poopData])

  const avgQuality = useMemo(() => {
    const sleepEntries = entries.filter(e => e.type === 'sleep' && e.quality)
    if (!sleepEntries.length) return '—'
    return (sleepEntries.reduce((a, b) => a + b.quality, 0) / sleepEntries.length).toFixed(1)
  }, [entries])

  const bestBristol = useMemo(() => {
    const poopEntries = entries.filter(e => e.type === 'poop')
    if (!poopEntries.length) return '—'
    const counts = {}
    poopEntries.forEach(e => { counts[e.bristolType] = (counts[e.bristolType] || 0) + 1 })
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return `Type ${best[0]}`
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
          <h1 className="text-2xl font-bold">Insights</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-500 font-medium">No data yet</p>
            <p className="text-gray-400 text-sm mt-1">Log a few days to see insights</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-gray-400 text-sm mt-0.5">Last 7 days</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-5 space-y-5">

        {/* Eat chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🍽️</span>
            <h2 className="font-bold text-gray-900">Meals Per Day</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={eatData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Bar dataKey="value" fill="#f97316" radius={[6,6,0,0]} name="Meals" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 divide-y divide-gray-100">
            <StatRow label="7-day total" value={totalMeals} sub="meals" />
            <StatRow label="Daily average" value={(totalMeals/7).toFixed(1)} sub="meals/day" />
          </div>
        </div>

        {/* Sleep chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">😴</span>
            <h2 className="font-bold text-gray-900">Sleep Hours</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={sleepData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} name="Hours" />
            </LineChart>
          </ResponsiveContainer>
          {/* 8hr goal line */}
          <div className="mt-3 divide-y divide-gray-100">
            <StatRow label="Avg sleep" value={avgSleep} sub="hrs/night" />
            <StatRow label="Avg quality" value={avgQuality} sub="/ 5 ⭐" />
            <StatRow label="Goal" value="8.0" sub="hrs (recommended)" />
          </div>
        </div>

        {/* Poop chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💩</span>
            <h2 className="font-bold text-gray-900">Bowel Movements</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={poopData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Bar dataKey="value" fill="#f59e0b" radius={[6,6,0,0]} name="Poops" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 divide-y divide-gray-100">
            <StatRow label="7-day total" value={totalPoops} sub="movements" />
            <StatRow label="Most common type" value={bestBristol} />
            <StatRow label="Healthy range" value="1–3" sub="per day" />
          </div>
        </div>

        {/* Health tip */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-4 text-white">
          <p className="font-bold text-base mb-1">💡 Health Tip</p>
          <p className="text-sm opacity-90">
            Healthy adults typically have 1–3 bowel movements per day, sleep 7–9 hours, and eat 3–5 meals.
            Track consistently to see your personal patterns.
          </p>
        </div>
      </div>
    </div>
  )
}
