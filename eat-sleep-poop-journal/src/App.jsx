import './index.css'
import { StoreProvider } from './store/useStore'
import { useHashRoute } from './hooks/useHashRoute'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Track from './pages/Track'
import Reflect from './pages/Reflect'
import History from './pages/History'
import Insights from './pages/Insights'
import WeeklyReview from './pages/WeeklyReview'
import Settings from './pages/Settings'

const VALID_PAGES = ['dashboard', 'schedule', 'track', 'reflect', 'history', 'insights', 'weeklyreview', 'settings']

function App() {
  const [page, navigate] = useHashRoute('dashboard', VALID_PAGES)

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
    <StoreProvider>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {pages[page]}
        {showNav && <BottomNav active={page} onNavigate={navigate} />}
      </div>
    </StoreProvider>
  )
}

export default App
