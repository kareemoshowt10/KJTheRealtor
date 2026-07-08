import './index.css'
import { StoreProvider } from './store/useStore'
import { ToastProvider, useToast } from './store/ToastContext'
import { useHashRoute } from './hooks/useHashRoute'
import BottomNav from './components/layout/BottomNav'
import SuccessToast from './components/common/SuccessToast'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Track from './pages/Track'
import Reflect from './pages/Reflect'
import History from './pages/History'
import Insights from './pages/Insights'
import WeeklyReview from './pages/WeeklyReview'
import Settings from './pages/Settings'

const VALID_PAGES = ['dashboard', 'schedule', 'track', 'reflect', 'history', 'insights', 'weeklyreview', 'settings']

function AppShell() {
  const [page, navigate] = useHashRoute('dashboard', VALID_PAGES)
  const { toast, dismissToast } = useToast()

  const pages = {
    dashboard:    <Dashboard onNavigate={navigate} />,
    schedule:     <Schedule />,
    track:        <Track onNavigate={navigate} />,
    reflect:      <Reflect />,
    history:      <History onNavigate={navigate} />,
    insights:     <Insights onNavigate={navigate} />,
    weeklyreview: <WeeklyReview onNavigate={navigate} />,
    settings:     <Settings onNavigate={navigate} />,
  }

  const showNav = !['settings', 'history', 'weeklyreview'].includes(page)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div key={page} className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {pages[page]}
      </div>
      {showNav && <BottomNav active={page} onNavigate={navigate} />}
      {toast && <SuccessToast message={toast.message} onDismiss={dismissToast} />}
    </div>
  )
}

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </StoreProvider>
  )
}

export default App
