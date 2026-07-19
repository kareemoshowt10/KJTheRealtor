import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const STORAGE_KEY = 'esp_journal_v1'

const DEFAULT_HABITS = [
  { id: 'h1', text: 'Avoid shopping on things that do not generate income' },
  { id: 'h2', text: 'Avoid substance abuse of any nature' },
  { id: 'h3', text: 'Avoid playing video games' },
  { id: 'h4', text: 'Avoid wasting time watching movies or tv shows' },
  { id: 'h5', text: 'Avoid immediate gratification (starve it)' },
]

const DEFAULT_MEMBERS = [
  { id: 'me', name: 'Me', emoji: '😀', color: 'violet', role: 'adult' },
]

function defaultState() {
  return {
    entries: [],
    dailyRecords: {},
    settings: {
      name: '',
      reminderEnabled: false,
      reminderTime: '20:00',
      habitList: DEFAULT_HABITS,
      members: DEFAULT_MEMBERS,
      activeMemberId: 'me',
    },
  }
}

function normalizeSettings(raw) {
  const settings = {
    name: '',
    reminderEnabled: false,
    reminderTime: '20:00',
    habitList: DEFAULT_HABITS,
    members: DEFAULT_MEMBERS,
    activeMemberId: 'me',
    ...(raw && typeof raw === 'object' ? raw : {}),
  }
  if (!Array.isArray(settings.members) || settings.members.length === 0) {
    settings.members = DEFAULT_MEMBERS
  }
  if (!settings.members.some(m => m.id === settings.activeMemberId)) {
    settings.activeMemberId = settings.members[0].id
  }
  return settings
}

function normalizeEntries(entries) {
  // Pre-family entries carry no memberId — stamp them as the owner's.
  return (Array.isArray(entries) ? entries : []).map(e =>
    e.memberId || e.type === 'timeblock' ? e : { ...e, memberId: 'me' }
  )
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        entries: normalizeEntries(parsed.entries),
        dailyRecords: parsed.dailyRecords || {},
        settings: normalizeSettings(parsed.settings),
      }
    }
  } catch {}
  return defaultState()
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function emptyDailyRecord() {
  return {
    objective: { mainObjective: '', keyActions: [] },
    reflection: { mind: '', feeling: '', reframe: '', special: '', lesson: '' },
    habits: {},
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => { save(state) }, [state])

  const addEntry = useCallback((entry) => {
    setState(s => ({ ...s, entries: [entry, ...s.entries] }))
  }, [])

  const updateEntry = useCallback((id, patch) => {
    setState(s => ({
      ...s,
      entries: s.entries.map(e => e.id === id ? { ...e, ...patch } : e),
    }))
  }, [])

  const deleteEntry = useCallback((id) => {
    setState(s => ({ ...s, entries: s.entries.filter(e => e.id !== id) }))
  }, [])

  const clearAllData = useCallback(() => {
    setState(s => ({ ...s, entries: [], dailyRecords: {} }))
  }, [])

  const importData = useCallback((data) => {
    setState({
      entries: normalizeEntries(data.entries),
      dailyRecords: data.dailyRecords && typeof data.dailyRecords === 'object' ? data.dailyRecords : {},
      settings: normalizeSettings(data.settings),
    })
  }, [])

  const updateSettings = useCallback((patch) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const getDailyRecord = useCallback((date) => {
    return state.dailyRecords[date] || emptyDailyRecord()
  }, [state.dailyRecords])

  const updateObjective = useCallback((date, patch) => {
    setState(s => {
      const existing = s.dailyRecords[date] || emptyDailyRecord()
      return {
        ...s,
        dailyRecords: {
          ...s.dailyRecords,
          [date]: { ...existing, objective: { ...existing.objective, ...patch } },
        },
      }
    })
  }, [])

  const updateReflection = useCallback((date, patch) => {
    setState(s => {
      const existing = s.dailyRecords[date] || emptyDailyRecord()
      return {
        ...s,
        dailyRecords: {
          ...s.dailyRecords,
          [date]: { ...existing, reflection: { ...existing.reflection, ...patch } },
        },
      }
    })
  }, [])

  const toggleHabit = useCallback((date, habitId) => {
    setState(s => {
      const existing = s.dailyRecords[date] || emptyDailyRecord()
      return {
        ...s,
        dailyRecords: {
          ...s.dailyRecords,
          [date]: {
            ...existing,
            habits: { ...existing.habits, [habitId]: !existing.habits[habitId] },
          },
        },
      }
    })
  }, [])

  const addHabit = useCallback((text) => {
    setState(s => ({
      ...s,
      settings: {
        ...s.settings,
        habitList: [...s.settings.habitList, { id: makeId(), text }],
      },
    }))
  }, [])

  const addMember = useCallback((member) => {
    setState(s => ({
      ...s,
      settings: {
        ...s.settings,
        members: [...s.settings.members, { id: makeId(), ...member }],
      },
    }))
  }, [])

  const updateMember = useCallback((memberId, patch) => {
    setState(s => ({
      ...s,
      settings: {
        ...s.settings,
        members: s.settings.members.map(m => m.id === memberId ? { ...m, ...patch } : m),
      },
    }))
  }, [])

  const removeMember = useCallback((memberId) => {
    setState(s => {
      if (s.settings.members.length <= 1) return s
      const members = s.settings.members.filter(m => m.id !== memberId)
      return {
        ...s,
        entries: s.entries.filter(e => e.memberId !== memberId),
        settings: {
          ...s.settings,
          members,
          activeMemberId: s.settings.activeMemberId === memberId
            ? members[0].id
            : s.settings.activeMemberId,
        },
      }
    })
  }, [])

  const setActiveMember = useCallback((memberId) => {
    setState(s => ({
      ...s,
      settings: { ...s.settings, activeMemberId: memberId },
    }))
  }, [])

  const removeHabit = useCallback((habitId) => {
    setState(s => {
      const dailyRecords = Object.fromEntries(
        Object.entries(s.dailyRecords).map(([date, record]) => {
          if (!(habitId in record.habits)) return [date, record]
          const { [habitId]: _removed, ...habits } = record.habits
          return [date, { ...record, habits }]
        })
      )
      return {
        ...s,
        dailyRecords,
        settings: {
          ...s.settings,
          habitList: s.settings.habitList.filter(h => h.id !== habitId),
        },
      }
    })
  }, [])

  return (
    <StoreContext.Provider value={{
      state, addEntry, updateEntry, deleteEntry, clearAllData, importData, updateSettings,
      getDailyRecord, updateObjective, updateReflection,
      toggleHabit, addHabit, removeHabit,
      addMember, updateMember, removeMember, setActiveMember,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
