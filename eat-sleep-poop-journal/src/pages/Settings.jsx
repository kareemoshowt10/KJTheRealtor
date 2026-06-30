import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ChevronRight, Trash2, Download, Upload } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-4 pt-4 pb-2">{title}</p>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function Row({ icon, label, children, danger }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${danger ? 'text-red-500' : 'text-gray-800'}`}>
      <span className="text-lg shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

export default function Settings() {
  const { state, updateSettings, deleteEntry } = useStore()
  const [name, setName] = useState(state.settings?.name || '')
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  function saveName() {
    updateSettings({ name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function exportData() {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `esp-journal-${new Date().toISOString().slice(0,10)}.json`
    a.click()
  }

  function clearAll() {
    state.entries.forEach(e => deleteEntry(e.id))
    setShowConfirm(false)
  }

  const totalEntries = state.entries.length
  const eatCount   = state.entries.filter(e => e.type === 'eat').length
  const sleepCount = state.entries.filter(e => e.type === 'sleep').length
  const poopCount  = state.entries.filter(e => e.type === 'poop').length

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-5 space-y-4">

        {/* Profile */}
        <Section title="Profile">
          <Row icon="👤" label="Your Name">
            <input
              className="text-sm text-right text-gray-500 focus:outline-none w-28 bg-transparent"
              placeholder="Optional"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => e.key === 'Enter' && saveName()}
            />
          </Row>
        </Section>

        {/* Stats */}
        <Section title="Your Stats">
          <Row icon="📊" label="Total entries"><span className="text-sm text-gray-500">{totalEntries}</span></Row>
          <Row icon="🍽️" label="Meals logged"><span className="text-sm text-gray-500">{eatCount}</span></Row>
          <Row icon="😴" label="Sleep sessions"><span className="text-sm text-gray-500">{sleepCount}</span></Row>
          <Row icon="💩" label="Bowel movements"><span className="text-sm text-gray-500">{poopCount}</span></Row>
        </Section>

        {/* Data */}
        <Section title="Data">
          <button onClick={exportData} className="w-full">
            <Row icon="📤" label="Export Journal (JSON)">
              <Download size={16} className="text-gray-400" />
            </Row>
          </button>
        </Section>

        {/* About */}
        <Section title="About">
          <Row icon="💩" label="Eat Sleep Poop Journal"><span className="text-sm text-gray-400">v1.0</span></Row>
          <Row icon="❤️" label="Made for your health"><span className="text-xs text-gray-400">Track daily</span></Row>
        </Section>

        {/* Coming soon */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-4 text-white">
          <p className="font-bold mb-1">🔒 Premium Features Coming Soon</p>
          <ul className="text-sm opacity-90 space-y-1 mt-2">
            <li>• Weight tracking</li>
            <li>• Water intake</li>
            <li>• Medication reminders</li>
            <li>• Blood pressure & heart rate</li>
            <li>• AI health insights</li>
            <li>• Cloud sync & backup</li>
          </ul>
        </div>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <button onClick={() => setShowConfirm(true)} className="w-full text-left">
            <Row icon="🗑️" label="Delete All Data" danger />
          </button>
        </Section>
      </div>

      {/* Confirm delete dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs animate-bounce-in">
            <div className="text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold mb-2">Delete all data?</h3>
              <p className="text-gray-500 text-sm mb-5">This will permanently delete all {totalEntries} entries. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3 font-semibold">
                Cancel
              </button>
              <button onClick={clearAll}
                className="flex-1 bg-red-500 text-white rounded-2xl py-3 font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
