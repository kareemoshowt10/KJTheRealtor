import { useState } from 'react'
import './index.css'
import { StoreProvider } from './store/useStore'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Insights from './pages/Insights'
import Settings from './pages/Settings'

function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    history:   <History />,
    insights:  <Insights />,
    settings:  <Settings />,
  }

  return (
    <StoreProvider>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {pages[page]}
        <BottomNav active={page} onNavigate={setPage} />
      </div>
    </StoreProvider>
  )
}

export default App
