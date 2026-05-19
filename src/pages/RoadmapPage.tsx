import { useMemo } from 'react'
import { useAppData } from '../storage/useAppData'
import { buildRoadmap, roadmapSummary, type RoadmapSlot } from '../lib/roadmap'
import { formatMonthShort } from '../lib/month'
import { formatPercent } from '../lib/format'
import ProgressBar from '../components/ProgressBar'
import EmptyState from '../components/EmptyState'

export default function RoadmapPage() {
  const { data, activeStrategy } = useAppData()

  const slots = useMemo(
    () => (activeStrategy ? buildRoadmap(activeStrategy, data.records) : []),
    [activeStrategy, data.records],
  )

  if (!activeStrategy) {
    return (
      <EmptyState
        emoji="🗺️"
        title="로드맵을 보려면 전략이 필요해요"
        description="전략 탭에서 투자 루틴을 골라주세요."
      />
    )
  }

  const summary = roadmapSummary(activeStrategy)
  const years: { year: number; slots: RoadmapSlot[] }[] = []
  for (const slot of slots) {
    let group = years.find((y) => y.year === slot.year)
    if (!group) {
      group = { year: slot.year, slots: [] }
      years.push(group)
    }
    group.slots.push(slot)
  }

  return (
    <div>
      <div className="page-intro">
        <h2>6년 로드맵</h2>
        <p>
          {summary.elapsed}개월 진행 · {summary.monthsLeft}개월 남았어요
        </p>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <strong>전체 진행률</strong>
          <span className="action-amount">
            {formatPercent(summary.elapsedRatio)}
          </span>
        </div>
        <ProgressBar ratio={summary.elapsedRatio} />
        <p className="muted" style={{ marginTop: 8 }}>
          딱 6년만 버티면, 그때부터는 돈이 나를 위해 일하기 시작해요.
        </p>
      </div>

      <div className="banner banner-info">
        <span>🟩</span>
        <span>완주한 달 · 🟥 놓친 달 · 🟦 이번 달 · ⬜ 앞으로의 달</span>
      </div>

      {years.map((group) => (
        <div key={group.year} className="roadmap-year">
          <div className="year-label">{group.year}년</div>
          <div className="roadmap-grid">
            {group.slots.map((slot) => (
              <div
                key={slot.month}
                className={`roadmap-slot ${slot.status}`}
                title={slot.month}
              >
                {formatMonthShort(slot.month)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
