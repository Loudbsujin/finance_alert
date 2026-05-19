import { useMemo } from 'react'
import { useAppData } from '../storage/useAppData'
import { bucketProgress } from '../lib/progress'
import { computeBadges, computeStreak } from '../lib/streak'
import { formatManwon, formatPercent } from '../lib/format'
import ProgressBar from '../components/ProgressBar'
import StreakBanner from '../components/StreakBanner'
import BadgeChip from '../components/BadgeChip'
import EmptyState from '../components/EmptyState'

export default function GoalsPage() {
  const { data, activeStrategy } = useAppData()

  const streak = useMemo(
    () =>
      activeStrategy
        ? computeStreak(activeStrategy, data.records)
        : { current: 0, best: 0, completedMonths: 0 },
    [activeStrategy, data.records],
  )
  const badges = useMemo(
    () =>
      activeStrategy
        ? computeBadges(activeStrategy, data.records, data.balances.length)
        : [],
    [activeStrategy, data.records, data.balances.length],
  )

  if (!activeStrategy) {
    return (
      <EmptyState
        emoji="🎯"
        title="목표를 보려면 전략이 필요해요"
        description="전략 탭에서 투자 루틴을 골라주세요."
      />
    )
  }

  const sorted = [...activeStrategy.buckets].sort((a, b) => a.order - b.order)
  const cappedBuckets = sorted.filter((b) => b.targetCap != null)
  const uncappedBuckets = sorted.filter((b) => b.targetCap == null)
  const earned = badges.filter((b) => b.earned).length

  return (
    <div>
      <div className="page-intro">
        <h2>목표 & 진행률</h2>
        <p>지금까지 {streak.completedMonths}개월을 완주했어요.</p>
      </div>

      <StreakBanner current={streak.current} best={streak.best} />

      {cappedBuckets.length > 0 && <div className="section-title">목표 항목</div>}
      {cappedBuckets.map((b) => {
        const p = bucketProgress(b, data.records)
        return (
          <div key={b.id} className="card">
            <div className="row-between" style={{ marginBottom: 8 }}>
              <strong>{b.name}</strong>
              <span className={p.capReached ? 'encouragement' : 'muted'}>
                {p.capReached ? '✅ 달성' : formatPercent(p.ratio)}
              </span>
            </div>
            <ProgressBar ratio={p.ratio} success={p.capReached} />
            <div className="muted" style={{ marginTop: 6 }}>
              {formatManwon(p.filled)} / {formatManwon(b.targetCap ?? 0)}
            </div>
          </div>
        )
      })}

      {uncappedBuckets.length > 0 && (
        <div className="section-title">누적 적립액</div>
      )}
      {uncappedBuckets.map((b) => {
        const p = bucketProgress(b, data.records)
        return (
          <div key={b.id} className="list-row">
            <span>{b.name}</span>
            <strong>{formatManwon(p.filled)}</strong>
          </div>
        )
      })}

      <div className="section-title">
        배지 ({earned} / {badges.length})
      </div>
      <div className="badge-grid">
        {badges.map((b) => (
          <BadgeChip key={b.id} badge={b} />
        ))}
      </div>
    </div>
  )
}
