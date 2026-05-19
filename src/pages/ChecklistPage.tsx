import { useMemo } from 'react'
import { useAppData } from '../storage/useAppData'
import { activeBucketsForMonth, monthProgress } from '../lib/progress'
import { currentMonth, formatMonthKo } from '../lib/month'
import { formatManwon } from '../lib/format'
import { shouldShowReminderBanner } from '../lib/notify'
import ActionItem from '../components/ActionItem'
import ProgressBar from '../components/ProgressBar'
import EncouragementCard from '../components/EncouragementCard'
import EmptyState from '../components/EmptyState'

export default function ChecklistPage() {
  const { data, activeStrategy, toggleCheck } = useAppData()
  const month = currentMonth()

  const buckets = useMemo(
    () => (activeStrategy ? activeBucketsForMonth(activeStrategy, data.records, month) : []),
    [activeStrategy, data.records, month],
  )
  const progress = useMemo(
    () => (activeStrategy ? monthProgress(activeStrategy, data.records, month) : null),
    [activeStrategy, data.records, month],
  )

  if (!activeStrategy || !progress) {
    return (
      <EmptyState
        emoji="🌱"
        title="아직 전략이 없어요"
        description="전략 탭에서 투자 루틴을 먼저 골라주세요."
      />
    )
  }

  const record = data.records.find((r) => r.month === month)
  const remaining = buckets.filter((b) => !record?.checks[b.id]?.done)
  const totalThisMonth = remaining.reduce((s, b) => s + b.monthlyAmount, 0)
  const showReminder = shouldShowReminderBanner(data)

  return (
    <div>
      <div className="page-intro">
        <h2>이번 달 할 일</h2>
        <p>{formatMonthKo(month)} · 체크만 하면 끝나요</p>
      </div>

      {showReminder && !progress.complete && (
        <div className="banner banner-warn">
          <span>⏰</span>
          <span>리마인더 날짜가 지났어요. 남은 항목을 마저 채워볼까요?</span>
        </div>
      )}

      <div className="card">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <strong>
            {progress.done} / {progress.total} 완료
          </strong>
          {!progress.complete && remaining.length > 0 && (
            <span className="muted">남은 금액 {formatManwon(totalThisMonth)}</span>
          )}
        </div>
        <ProgressBar ratio={progress.ratio} success={progress.complete} />
      </div>

      {progress.complete && <EncouragementCard month={month} />}

      {buckets.map((b) => (
        <ActionItem
          key={b.id}
          bucket={b}
          done={!!record?.checks[b.id]?.done}
          onToggle={() => toggleCheck(month, b.id)}
        />
      ))}

      {buckets.length === 0 && (
        <EmptyState
          emoji="🎉"
          title="이번 달 할 일이 없어요"
          description="모든 목표 항목을 채웠어요. 전략 탭에서 항목을 추가할 수 있어요."
        />
      )}
    </div>
  )
}
