import { useMemo } from 'react'
import { ChevronLeft, Trophy, AlertTriangle, Sparkles } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { useStore } from '../store/useStore'
import { isSameLocalDay } from '../utils/dateUtils'
import { calcReflectionAP, calcHabitScore } from '../utils/scoring'

function last7Keys() {
  return Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))
}

function StatTile({ emoji, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="text-xl mb-1">{emoji}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub || label}</p>
    </div>
  )
}

export default function WeeklyReview({ onNavigate }) {
  const { state } = useStore()
  const days = useMemo(() => last7Keys(), [])
  const rangeLabel = `${format(subDays(new Date(), 6), 'MMM d')} – ${format(new Date(), 'MMM d')}`

  const forDay = (key, type) => state.entries.filter(e =>
    e.type === type && isSameLocalDay(e.timestamp || e.startTime, key)
  )

  const stats = useMemo(() => {
    const totalMeals = days.reduce((s, k) => s + forDay(k, 'eat').length, 0)
    const totalPoops = days.reduce((s, k) => s + forDay(k, 'poop').length, 0)
    const totalWorkouts = days.reduce((s, k) => s + forDay(k, 'exercise').length, 0)
    const totalContacts = days.reduce((s, k) => s + forDay(k, 'contact').length, 0)
    const totalMeditateMin = days.reduce((s, k) => s + forDay(k, 'meditation').reduce((a, e) => a + (e.durationMin || 0), 0), 0)
    const totalReadMin = days.reduce((s, k) => s + forDay(k, 'reading').reduce((a, e) => a + (e.durationMin || 0), 0), 0)

    const sleepHoursByDay = days.map(k =>
      forDay(k, 'sleep').reduce((a, e) => a + (new Date(e.endTime) - new Date(e.startTime)) / 3600000, 0)
    )
    const sleptDays = sleepHoursByDay.filter(h => h > 0)
    const avgSleep = sleptDays.length ? sleptDays.reduce((a, b) => a + b, 0) / sleptDays.length : 0

    const apByDay = days.map(k => {
      const record = state.dailyRecords[k]
      return record ? calcReflectionAP(record.reflection).total : 0
    })
    const totalAP = apByDay.reduce((a, b) => a + b, 0)
    const maxAP = days.length * 7

    const habitPctByDay = days.map(k => {
      const record = state.dailyRecords[k]
      return record ? calcHabitScore(record.habits, state.settings.habitList).pct : null
    }).filter(v => v !== null)
    const avgHabitPct = habitPctByDay.length
      ? Math.round(habitPctByDay.reduce((a, b) => a + b, 0) / habitPctByDay.length)
      : null

    const objectivesSet = days.filter(k => state.dailyRecords[k]?.objective?.mainObjective?.trim()).length
    const keyActionsTotal = days.reduce((s, k) => s + (state.dailyRecords[k]?.objective?.keyActions?.length || 0), 0)
    const keyActionsDone = days.reduce((s, k) =>
      s + (state.dailyRecords[k]?.objective?.keyActions?.filter(a => a.done).length || 0), 0)

    const bestAPDayIdx = apByDay.indexOf(Math.max(...apByDay))
    const bestAPDay = apByDay[bestAPDayIdx] > 0 ? format(subDays(new Date(), 6 - bestAPDayIdx), 'EEEE') : null

    const hasAnyActivity = totalMeals + totalPoops + totalWorkouts + totalContacts +
      totalMeditateMin + totalReadMin + sleptDays.length + totalAP + objectivesSet > 0

    return {
      totalMeals, totalPoops, totalWorkouts, totalContacts, totalMeditateMin, totalReadMin,
      avgSleep, totalAP, maxAP, avgHabitPct, objectivesSet, keyActionsTotal, keyActionsDone, bestAPDay,
      hasAnyActivity,
    }
  }, [days, state.entries, state.dailyRecords, state.settings.habitList])

  const wins = useMemo(() => {
    if (!stats.hasAnyActivity) return []
    const list = []
    if (stats.bestAPDay) list.push(`Your best awareness day was ${stats.bestAPDay} — nice reflection habit forming.`)
    if (stats.avgSleep >= 7) list.push(`Averaged ${stats.avgSleep.toFixed(1)}h of sleep — right in the healthy range.`)
    if (stats.avgHabitPct !== null && stats.avgHabitPct >= 80) list.push(`Avoided ${stats.avgHabitPct}% of your watch-list items on average — strong self-control this week.`)
    if (stats.totalWorkouts >= 3) list.push(`Logged ${stats.totalWorkouts} workouts this week.`)
    if (stats.keyActionsTotal > 0 && stats.keyActionsDone === stats.keyActionsTotal) list.push(`Completed every key action you set for yourself this week.`)
    if (stats.totalContacts >= 5) list.push(`Reached out to ${stats.totalContacts} contacts — relationships compound.`)
    return list
  }, [stats])

  const watchouts = useMemo(() => {
    if (!stats.hasAnyActivity) return []
    const list = []
    if (stats.avgSleep > 0 && stats.avgSleep < 6.5) list.push(`Averaged only ${stats.avgSleep.toFixed(1)}h of sleep — under the recommended 7–9h.`)
    if (stats.avgHabitPct !== null && stats.avgHabitPct < 50) list.push(`Only avoided ${stats.avgHabitPct}% of watch-list items on average — worth revisiting what's pulling focus.`)
    if (stats.objectivesSet < 3) list.push(`Only set a daily objective on ${stats.objectivesSet}/7 days — a clear target each morning tends to compound.`)
    if (stats.totalWorkouts === 0) list.push(`No workouts logged this week.`)
    if (stats.totalAP === 0) list.push(`No evening reflections this week — even a couple minutes helps you catch patterns.`)
    return list
  }, [stats])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={() => onNavigate('insights')} className="p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Weekly Review</h1>
          <p className="text-gray-400 text-sm mt-0.5">{rangeLabel}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-4 space-y-4">

        {!stats.hasAnyActivity ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Not enough data yet</p>
            <p className="text-gray-400 text-sm mt-1">Log a few days to get your first weekly review</p>
          </div>
        ) : (
          <>
            {/* Headline AP score */}
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-5 text-white text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sparkles size={18} />
                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Weekly Awareness Points</p>
              </div>
              <p className="text-4xl font-bold">{stats.totalAP}<span className="text-lg opacity-70">/{stats.maxAP}</span></p>
            </div>

            {/* Wins */}
            {wins.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={18} className="text-amber-500" />
                  <p className="font-bold text-gray-900">Wins This Week</p>
                </div>
                <ul className="space-y-2">
                  {wins.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700 bg-amber-50 rounded-xl px-3 py-2">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* By the numbers */}
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">By The Numbers</p>
              <div className="grid grid-cols-2 gap-3">
                <StatTile emoji="🍽️" value={stats.totalMeals} sub="meals logged" />
                <StatTile emoji="😴" value={stats.avgSleep > 0 ? `${stats.avgSleep.toFixed(1)}h` : '—'} sub="avg sleep/night" />
                <StatTile emoji="💪" value={stats.totalWorkouts} sub="workouts" />
                <StatTile emoji="🧘" value={`${stats.totalMeditateMin}m`} sub="meditation" />
                <StatTile emoji="📖" value={`${stats.totalReadMin}m`} sub="reading" />
                <StatTile emoji="📇" value={stats.totalContacts} sub="contacts reached" />
                <StatTile emoji="🎯" value={`${stats.objectivesSet}/7`} sub="days with an objective" />
                <StatTile emoji="🛡️" value={stats.avgHabitPct !== null ? `${stats.avgHabitPct}%` : '—'} sub="avoidance success" />
              </div>
            </div>

            {/* Watch-outs */}
            {watchouts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-red-500" />
                  <p className="font-bold text-gray-900">Worth Watching</p>
                </div>
                <ul className="space-y-2">
                  {watchouts.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700 bg-red-50 rounded-xl px-3 py-2">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
