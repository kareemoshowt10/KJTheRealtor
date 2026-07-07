import { useState } from 'react'
import './index.css'
import { StoreProvider } from './store/useStore'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Track from './pages/Track'
import Reflect from './pages/Reflect'
import History from './pages/History'
import Insights from './pages/Insights'
import Settings from './pages/Settings'

function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    schedule:  <Schedule />,
    track:     <Track onNavigate={setPage} />,
    reflect:   <Reflect />,
    history:   <History onNavigate={setPage} />,
    insights:  <Insights />,
    settings:  <Settings onNavigate={setPage} />,
  }

  const showNav = page !== 'settings' && page !== 'history'

  return (
    <StoreProvider>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {pages[page]}
        {showNav && <BottomNav active={page} onNavigate={setPage} />}
      </div>
    </StoreProvider>
  )
}

export default App
