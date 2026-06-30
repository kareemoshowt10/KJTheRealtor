import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const STORAGE_KEY = 'esp_journal_v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { entries: [], settings: { name: '', reminderEnabled: false } }
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => { save(state) }, [state])

  const addEntry = useCallback((entry) => {
    setState(s => ({ ...s, entries: [entry, ...s.entries] }))
  }, [])

  const deleteEntry = useCallback((id) => {
    setState(s => ({ ...s, entries: s.entries.filter(e => e.id !== id) }))
  }, [])

  const updateSettings = useCallback((patch) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  return (
    <StoreContext.Provider value={{ state, addEntry, deleteEntry, updateSettings }}>
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
