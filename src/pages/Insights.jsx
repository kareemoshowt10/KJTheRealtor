import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { format, subDays, parseISO } from 'date-fns'
import { useStore } from '../store/useStore'
import { calcReflectionAP, calcHabitScore } from '../utils/scoring'
import { isSameLocalDay } from '../utils/dateUtils'
import { getMember, entryMemberId } from '../utils/memberUtils'
import MemberSwitcher from '../components/family/MemberSwitcher'

function getLast7(entries, type, getValue) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const key = format(d, 'yyyy-MM-dd')
    const dayEntries = entries.filter(e =>
      e.type === type && isSameLocalDay(e.timestamp || e.startTime, key)
    )
    return { day: format(d, 'EEE'), value: getValue(dayEntries) }
  })
  return days
}

function getLast7Records(dailyRecords, habitList, getValue) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const key = format(d, 'yyyy-MM-dd')
    const record = dailyRecords[key]
    return { day: format(d, 'EEE'), value: getValue(record, habitList) }
  })
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

export default function Insights({ onNavigate }) {
  const { state, setActiveMember } = useStore()
  const { members, activeMemberId } = state.settings
  const activeMember = getMember(members, activeMemberId)
  const isChildView = activeMember.role === 'child'

  const entries = useMemo(() =>
    state.entries.filter(e => e.type === 'timeblock' || entryMemberId(e) === activeMember.id)
  , [state.entries, activeMember.id])

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

  const mindData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      const key = format(d, 'yyyy-MM-dd')
      const meditate = entries.filter(e => e.type === 'meditation' && isSameLocalDay(e.timestamp, key))
        .reduce((s, e) => s + (e.durationMin || 0), 0)
      const read = entries.filter(e => e.type === 'reading' && isSameLocalDay(e.timestamp, key))
        .reduce((s, e) => s + (e.durationMin || 0), 0)
      return { day: format(d, 'EEE'), meditate, read }
    })
    return days
  }, [entries])

  const peeData = useMemo(() => getLast7(entries, 'pee', d => d.length), [entries])
  const totalPees = useMemo(() => peeData.reduce((a, b) => a + b.value, 0), [peeData])
  const hasPee = useMemo(() => entries.some(e => e.type === 'pee'), [entries])

  const growth = useMemo(() => {
    const ms = entries.filter(e => e.type === 'measurement')
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    const toSeries = kind => ms.filter(m => m.measureType === kind)
      .map(m => ({ date: format(parseISO(m.timestamp), 'MMM d'), value: m.value, unit: m.unit }))
    const weight = toSeries('weight')
    const height = toSeries('height')
    return {
      has: ms.length > 0,
      weight, height,
      latestWeight: weight[weight.length - 1],
      latestHeight: height[height.length - 1],
    }
  }, [entries])

  const exerciseData = useMemo(() => getLast7(entries, 'exercise', d => d.length), [entries])
  const contactData = useMemo(() => getLast7(entries, 'contact', d => d.length), [entries])

  const apData = useMemo(() =>
    getLast7Records(state.dailyRecords, state.settings.habitList, (record) =>
      record ? calcReflectionAP(record.reflection).total : 0
    )
  , [state.dailyRecords, state.settings.habitList])

  const habitData = useMemo(() =>
    getLast7Records(state.dailyRecords, state.settings.habitList, (record, habitList) =>
      record ? calcHabitScore(record.habits, habitList).pct : 0
    )
  , [state.dailyRecords, state.settings.habitList])

  const totalMeditateMin = useMemo(() => mindData.reduce((a, b) => a + b.meditate, 0), [mindData])
  const totalReadMin = useMemo(() => mindData.reduce((a, b) => a + b.read, 0), [mindData])
  const totalExercises = useMemo(() => exerciseData.reduce((a, b) => a + b.value, 0), [exerciseData])
  const totalContacts = useMemo(() => contactData.reduce((a, b) => a + b.value, 0), [contactData])
  const avgAP = useMemo(() => {
    const vals = apData.map(d => d.value)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
  }, [apData])
  const avgHabitPct = useMemo(() => {
    const vals = habitData.map(d => d.value).filter((_, i) => state.dailyRecords[format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')])
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }, [habitData, state.dailyRecords])

  const hasDailyRecordData = useMemo(() =>
    Object.values(state.dailyRecords).some(record => {
      const hasObjective = record.objective?.mainObjective?.trim() || record.objective?.keyActions?.length > 0
      const hasReflection = Object.values(record.reflection || {}).some(v => v?.trim())
      const hasHabits = Object.values(record.habits || {}).some(Boolean)
      return hasObjective || hasReflection || hasHabits
    })
  , [state.dailyRecords])

  if (entries.length === 0 && (isChildView || !hasDailyRecordData)) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Insights</h1>
            <button onClick={() => onNavigate('weeklyreview')}
              className="bg-violet-600 text-white text-sm font-semibold rounded-full px-4 py-2 shadow-sm active:scale-95 transition-transform">
              Weekly Review
            </button>
          </div>
          {members.length > 1 && (
            <div className="mt-3">
              <MemberSwitcher members={members} activeId={activeMemberId} onSelect={setActiveMember} />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-500 font-medium">
              {members.length > 1 ? `No data for ${activeMember.name} yet` : 'No data yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Log a few days to see insights</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {members.length > 1 ? `${activeMember.name} · Last 7 days` : 'Last 7 days'}
            </p>
          </div>
          <button onClick={() => onNavigate('weeklyreview')}
            className="bg-violet-600 text-white text-sm font-semibold rounded-full px-4 py-2 shadow-sm active:scale-95 transition-transform">
            Weekly Review
          </button>
        </div>
        {members.length > 1 && (
          <div className="mt-3">
            <MemberSwitcher members={members} activeId={activeMemberId} onSelect={setActiveMember} />
          </div>
        )}
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

        {/* Pee chart — only when tracked */}
        {hasPee && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💧</span>
              <h2 className="font-bold text-gray-900">Pee / Diapers</h2>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={peeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[6,6,0,0]} name="Pees" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 divide-y divide-gray-100">
              <StatRow label="7-day total" value={totalPees} sub="times" />
              <StatRow label="Daily average" value={(totalPees/7).toFixed(1)} sub="per day" />
            </div>
          </div>
        )}

        {/* Growth chart — only when measurements exist */}
        {growth.has && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📏</span>
              <h2 className="font-bold text-gray-900">Growth</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-700 font-medium">Latest weight</p>
                <p className="text-xl font-bold text-emerald-800 mt-0.5">
                  {growth.latestWeight ? `${growth.latestWeight.value} ${growth.latestWeight.unit}` : '—'}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-700 font-medium">Latest height</p>
                <p className="text-xl font-bold text-emerald-800 mt-0.5">
                  {growth.latestHeight ? `${growth.latestHeight.value} ${growth.latestHeight.unit}` : '—'}
                </p>
              </div>
            </div>
            {growth.weight.length >= 2 && (
              <>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Weight trend</p>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={growth.weight} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 3 }} name="Weight" />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
            {growth.height.length >= 2 && (
              <>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1 mt-3">Height trend</p>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={growth.height} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: '#0d9488', r: 3 }} name="Height" />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
            {growth.weight.length < 2 && growth.height.length < 2 && (
              <p className="text-xs text-gray-400 text-center py-2">Log at least 2 measurements to see a trend line.</p>
            )}
          </div>
        )}

        {/* Personal modules — adults only */}
        {!isChildView && (<>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧘</span>
            <h2 className="font-bold text-gray-900">Mind & Focus</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={mindData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Bar dataKey="meditate" stackId="a" fill="#14b8a6" radius={[0,0,0,0]} name="Meditate (min)" />
              <Bar dataKey="read" stackId="a" fill="#0ea5e9" radius={[6,6,0,0]} name="Read (min)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 divide-y divide-gray-100">
            <StatRow label="Meditation this week" value={totalMeditateMin} sub="min" />
            <StatRow label="Reading this week" value={totalReadMin} sub="min" />
          </div>
        </div>

        {/* Exercise + Contacts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💪</span>
              <h2 className="font-bold text-gray-900 text-sm">Workouts</h2>
            </div>
            <p className="text-2xl font-bold mt-2">{totalExercises}</p>
            <p className="text-xs text-gray-400">this week</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📇</span>
              <h2 className="font-bold text-gray-900 text-sm">Contacts</h2>
            </div>
            <p className="text-2xl font-bold mt-2">{totalContacts}</p>
            <p className="text-xs text-gray-400">this week</p>
          </div>
        </div>

        {/* Awareness Points trend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <h2 className="font-bold text-gray-900">Awareness Points</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={apData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 7]} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: '#d946ef', r: 4 }} name="AP" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 divide-y divide-gray-100">
            <StatRow label="Avg per day" value={avgAP} sub="/ 7 AP" />
          </div>
        </div>

        {/* Avoidance list success */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛡️</span>
            <h2 className="font-bold text-gray-900">Avoidance List Success</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={habitData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} formatter={v => `${v}%`} />
              <Bar dataKey="value" fill="#ef4444" radius={[6,6,0,0]} name="% Avoided" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 divide-y divide-gray-100">
            <StatRow label="Avg success rate" value={`${avgHabitPct}%`} />
          </div>
        </div>
        </>)}

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
