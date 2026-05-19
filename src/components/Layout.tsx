import { NavLink, Outlet } from 'react-router-dom'
import { useAppData } from '../storage/useAppData'
import { computeStreak } from '../lib/streak'
import { formatMonthKo, currentMonth } from '../lib/month'

const TABS = [
  { to: '/', icon: '✅', label: '할 일', end: true },
  { to: '/goals', icon: '🎯', label: '목표' },
  { to: '/roadmap', icon: '🗺️', label: '로드맵' },
  { to: '/growth', icon: '📈', label: '자산' },
  { to: '/strategy', icon: '🧭', label: '전략' },
]

export default function Layout() {
  const { data, activeStrategy } = useAppData()
  const streak = activeStrategy
    ? computeStreak(activeStrategy, data.records)
    : { current: 0, best: 0, completedMonths: 0 }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>{activeStrategy ? activeStrategy.name : '돈나무'}</h1>
          <div className="sub">{formatMonthKo(currentMonth())}</div>
        </div>
        <div className="header-actions">
          {activeStrategy && (
            <div className="streak-pill">🔥 {streak.current}개월</div>
          )}
          <NavLink to="/settings" className="header-settings" aria-label="설정">
            ⚙️
          </NavLink>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}>
            <span className="nav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
