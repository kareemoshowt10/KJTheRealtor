import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useToast } from '../store/ToastContext'
import { ChevronLeft, Trash2, Download, Upload, Plus, X, Bell, Pencil } from 'lucide-react'
import MemberAvatar from '../components/family/MemberAvatar'
import MemberModal from '../components/family/MemberModal'

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

export default function Settings({ onNavigate }) {
  const { state, updateSettings, clearAllData, importData, addHabit, removeHabit,
    addMember, updateMember, removeMember } = useStore()
  const { showToast } = useToast()
  const [memberModal, setMemberModal] = useState(undefined) // undefined = closed, null = new, obj = edit
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null)
  const [name, setName] = useState(state.settings?.name || '')
  const [newHabit, setNewHabit] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const [importError, setImportError] = useState('')
  const [notifBlocked, setNotifBlocked] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'denied'
  )
  const fileInputRef = useRef(null)

  function saveName() {
    updateSettings({ name: name.trim() })
  }

  async function toggleReminder() {
    const next = !state.settings.reminderEnabled
    if (next && typeof Notification !== 'undefined') {
      if (Notification.permission === 'denied') {
        setNotifBlocked(true)
        return
      }
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          setNotifBlocked(perm === 'denied')
          return
        }
      }
    }
    updateSettings({ reminderEnabled: next })
    showToast(next ? 'Reminder turned on 🔔' : 'Reminder turned off')
  }

  function exportData() {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `life-os-${new Date().toISOString().slice(0,10)}.json`
    a.click()
  }

  function clearAll() {
    clearAllData()
    setShowConfirm(false)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data || typeof data !== 'object' || (!('entries' in data) && !('dailyRecords' in data))) {
          setImportError('That file doesn\'t look like a Life OS backup.')
          return
        }
        setPendingImport(data)
      } catch {
        setImportError('Could not read that file — make sure it\'s a valid backup JSON.')
      }
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    importData(pendingImport)
    setPendingImport(null)
  }

  function submitHabit(e) {
    e.preventDefault()
    if (!newHabit.trim()) return
    addHabit(newHabit.trim())
    setNewHabit('')
  }

  const totalEntries = state.entries.length
  const counts = {
    eat: state.entries.filter(e => e.type === 'eat').length,
    sleep: state.entries.filter(e => e.type === 'sleep').length,
    poop: state.entries.filter(e => e.type === 'poop').length,
    meditation: state.entries.filter(e => e.type === 'meditation').length,
    reading: state.entries.filter(e => e.type === 'reading').length,
    exercise: state.entries.filter(e => e.type === 'exercise').length,
    contact: state.entries.filter(e => e.type === 'contact').length,
    timeblock: state.entries.filter(e => e.type === 'timeblock').length,
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-5 shadow-sm flex items-center gap-3">
        <button onClick={() => onNavigate('dashboard')} className="p-1 -ml-1 rounded-full hover:bg-gray-100 active:scale-90 transition-transform">
          <ChevronLeft size={22} />
        </button>
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

        {/* Family */}
        <Section title="Family">
          {state.settings.members.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <MemberAvatar member={m} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                <p className="text-xs text-gray-400 capitalize">{m.role === 'child' ? 'Kid' : 'Adult'}</p>
              </div>
              <button onClick={() => setMemberModal(m)} className="p-1.5 text-gray-300 hover:text-violet-500 active:scale-90 transition-transform">
                <Pencil size={15} />
              </button>
              {state.settings.members.length > 1 && (
                <button onClick={() => setConfirmRemoveMember(m)} className="p-1.5 text-gray-300 hover:text-red-500 active:scale-90 transition-transform">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setMemberModal(null)}
            className="w-full flex items-center gap-2 px-4 py-3.5 text-violet-600 text-sm font-semibold active:bg-violet-50 transition-colors">
            <Plus size={16} /> Add Family Member
          </button>
        </Section>

        {/* Reminders */}
        <Section title="Reminders">
          <Row icon={<Bell size={18} />} label="Daily Reflection Reminder">
            <button
              onClick={toggleReminder}
              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${state.settings.reminderEnabled ? 'bg-violet-600' : 'bg-gray-200'}`}
              aria-pressed={state.settings.reminderEnabled}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.settings.reminderEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </Row>
          {state.settings.reminderEnabled && (
            <Row icon="⏰" label="Remind me at">
              <input
                type="time"
                value={state.settings.reminderTime}
                onChange={e => updateSettings({ reminderTime: e.target.value })}
                className="text-sm text-right text-gray-600 focus:outline-none bg-transparent"
              />
            </Row>
          )}
          {notifBlocked && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3">
              Notifications are blocked for this site. Enable them in your browser's site settings to use reminders.
            </p>
          )}
          {!notifBlocked && (
            <p className="text-xs text-gray-400 px-4 py-3">
              Fires a browser notification once a day to nudge you toward your evening reflection. Keep the app open in a tab or installed as a PWA for it to work reliably.
            </p>
          )}
        </Section>

        {/* Stats */}
        <Section title="Your Stats">
          <Row icon="📊" label="Total entries"><span className="text-sm text-gray-500">{totalEntries}</span></Row>
          <Row icon="🍽️" label="Meals logged"><span className="text-sm text-gray-500">{counts.eat}</span></Row>
          <Row icon="😴" label="Sleep sessions"><span className="text-sm text-gray-500">{counts.sleep}</span></Row>
          <Row icon="💩" label="Bowel movements"><span className="text-sm text-gray-500">{counts.poop}</span></Row>
          <Row icon="🧘" label="Meditation sessions"><span className="text-sm text-gray-500">{counts.meditation}</span></Row>
          <Row icon="📖" label="Reading sessions"><span className="text-sm text-gray-500">{counts.reading}</span></Row>
          <Row icon="💪" label="Workouts logged"><span className="text-sm text-gray-500">{counts.exercise}</span></Row>
          <Row icon="📇" label="Contacts logged"><span className="text-sm text-gray-500">{counts.contact}</span></Row>
          <Row icon="🗓️" label="Time blocks planned"><span className="text-sm text-gray-500">{counts.timeblock}</span></Row>
        </Section>

        {/* Avoidance list customization */}
        <Section title="Avoidance List">
          {state.settings.habitList.map(h => (
            <div key={h.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 text-sm text-gray-700">{h.text}</span>
              <button onClick={() => removeHabit(h.id)} className="text-gray-300 hover:text-red-500 active:scale-90 transition-transform">
                <X size={16} />
              </button>
            </div>
          ))}
          <form onSubmit={submitHabit} className="flex items-center gap-2 px-4 py-3">
            <input
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400"
              placeholder="Add something to avoid..."
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
            />
            <button type="submit" className="bg-violet-600 text-white rounded-lg p-2 active:scale-90 transition-transform">
              <Plus size={16} />
            </button>
          </form>
        </Section>

        {/* Data */}
        <Section title="Data">
          <button onClick={exportData} className="w-full active:bg-gray-50 transition-colors">
            <Row icon="📤" label="Export Journal (JSON)">
              <Download size={16} className="text-gray-400" />
            </Row>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full active:bg-gray-50 transition-colors">
            <Row icon="📥" label="Import Backup (JSON)">
              <Upload size={16} className="text-gray-400" />
            </Row>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelect}
            className="hidden"
          />
          {importError && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3">{importError}</p>
          )}
        </Section>

        {/* About */}
        <Section title="About">
          <Row icon="🧭" label="Life OS"><span className="text-sm text-gray-400">v1.0</span></Row>
          <Row icon="❤️" label="Built for daily productivity"><span className="text-xs text-gray-400">Track daily</span></Row>
        </Section>

        {/* Coming soon */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-4 text-white">
          <p className="font-bold mb-1">🔒 Premium Features Coming Soon</p>
          <ul className="text-sm opacity-90 space-y-1 mt-2">
            <li>• Weight & body composition tracking</li>
            <li>• Water intake & medication reminders</li>
            <li>• Monthly Life OS review reports</li>
            <li>• AI-powered pattern insights & coaching</li>
            <li>• Spendable rewards shop for Awareness Points</li>
            <li>• Cloud sync & backup across devices</li>
          </ul>
        </div>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <button onClick={() => setShowConfirm(true)} className="w-full text-left active:bg-red-50 transition-colors">
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
              <p className="text-gray-500 text-sm mb-5">This will permanently delete all {totalEntries} entries plus every objective, reflection, and avoidance check-in. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3 font-semibold active:scale-95 transition-transform">
                Cancel
              </button>
              <button onClick={clearAll}
                className="flex-1 bg-red-500 text-white rounded-2xl py-3 font-semibold active:scale-95 transition-transform">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member add/edit modal */}
      {memberModal !== undefined && (
        <MemberModal
          existing={memberModal}
          onSave={(data) => {
            if (memberModal) {
              updateMember(memberModal.id, data)
              showToast(`${data.name} updated`)
            } else {
              addMember(data)
              showToast(`${data.name} added to the family 🎉`)
            }
          }}
          onClose={() => setMemberModal(undefined)}
        />
      )}

      {/* Confirm remove member dialog */}
      {confirmRemoveMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs animate-bounce-in">
            <div className="text-center">
              <div className="text-5xl mb-3">{confirmRemoveMember.emoji}</div>
              <h3 className="text-lg font-bold mb-2">Remove {confirmRemoveMember.name}?</h3>
              <p className="text-gray-500 text-sm mb-5">
                This removes {confirmRemoveMember.name} and permanently deletes all
                {' '}{state.entries.filter(e => e.memberId === confirmRemoveMember.id).length} of their logged entries.
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemoveMember(null)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3 font-semibold active:scale-95 transition-transform">
                Cancel
              </button>
              <button onClick={() => { removeMember(confirmRemoveMember.id); setConfirmRemoveMember(null) }}
                className="flex-1 bg-red-500 text-white rounded-2xl py-3 font-semibold active:scale-95 transition-transform">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm import dialog */}
      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs animate-bounce-in">
            <div className="text-center">
              <div className="text-5xl mb-3">📥</div>
              <h3 className="text-lg font-bold mb-2">Restore this backup?</h3>
              <p className="text-gray-500 text-sm mb-5">
                This will replace all {totalEntries} current entries and daily records with
                {' '}{Array.isArray(pendingImport.entries) ? pendingImport.entries.length : 0} entries
                from the backup file. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPendingImport(null)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3 font-semibold active:scale-95 transition-transform">
                Cancel
              </button>
              <button onClick={confirmImport}
                className="flex-1 bg-violet-600 text-white rounded-2xl py-3 font-semibold active:scale-95 transition-transform">
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
