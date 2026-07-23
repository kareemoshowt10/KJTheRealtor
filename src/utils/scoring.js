const CORE_FIELDS = ['mind', 'feeling', 'reframe']
const EXTRA_FIELDS = ['special', 'lesson']

export function calcReflectionAP(reflection) {
  if (!reflection) return { core: 0, extra: 0, total: 0, maxCore: 3, maxExtra: 4, max: 7 }
  const core = CORE_FIELDS.filter(f => reflection[f]?.trim()).length
  const extraAnswered = EXTRA_FIELDS.filter(f => reflection[f]?.trim()).length
  const extra = extraAnswered === EXTRA_FIELDS.length ? 4 : extraAnswered * 2
  return { core, extra, total: core + extra, maxCore: 3, maxExtra: 4, max: 7 }
}

export function calcHabitScore(habits, habitList) {
  if (!habitList?.length) return { avoided: 0, total: 0, pct: 0 }
  const avoided = habitList.filter(h => habits?.[h.id]).length
  return { avoided, total: habitList.length, pct: Math.round((avoided / habitList.length) * 100) }
}
