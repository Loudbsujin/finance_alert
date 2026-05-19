import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ChecklistPage from './pages/ChecklistPage'
import GoalsPage from './pages/GoalsPage'
import RoadmapPage from './pages/RoadmapPage'
import GrowthPage from './pages/GrowthPage'
import StrategyPage from './pages/StrategyPage'
import SettingsPage from './pages/SettingsPage'
import { useAppData } from './storage/useAppData'
import { maybeShowMonthlyReminder } from './lib/notify'

export default function App() {
  const { data, activeStrategy, setSettings } = useAppData()
  const location = useLocation()

  // 앱 로드 시 1회 월간 리마인더 점검
  useEffect(() => {
    const result = maybeShowMonthlyReminder(data)
    if (result) setSettings(result)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 전략이 없으면 전략 페이지로 유도
  if (!activeStrategy && location.pathname !== '/strategy') {
    return <Navigate to="/strategy" replace />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ChecklistPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="growth" element={<GrowthPage />} />
        <Route path="strategy" element={<StrategyPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
