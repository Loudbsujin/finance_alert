import type { MonthlyRecord, Strategy } from '../types/model'
import { addMonths, compareMonth, currentMonth, monthsBetween } from './month'
import { monthProgress } from './progress'

export interface StreakInfo {
  current: number
  best: number
  completedMonths: number
}

/** 현재 스트릭 / 최고 스트릭 / 총 완료 개월 */
export function computeStreak(
  strategy: Strategy,
  records: MonthlyRecord[],
): StreakInfo {
  const now = currentMonth()
  const isComplete = (m: string) => monthProgress(strategy, records, m).complete

  // 현재 스트릭: 현재 월부터 역방향. 현재 월이 미완료여도 스트릭은 깨지지 않음.
  let cursor = isComplete(now) ? now : addMonths(now, -1)
  let current = 0
  while (compareMonth(cursor, strategy.startMonth) >= 0 && isComplete(cursor)) {
    current += 1
    cursor = addMonths(cursor, -1)
  }

  // 전체 구간 스캔
  let best = 0
  let run = 0
  let completedMonths = 0
  const span = Math.max(0, monthsBetween(strategy.startMonth, now))
  for (let i = 0; i <= span; i += 1) {
    const m = addMonths(strategy.startMonth, i)
    if (isComplete(m)) {
      run += 1
      completedMonths += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  return { current, best, completedMonths }
}

export interface Badge {
  id: string
  emoji: string
  label: string
  description: string
  earned: boolean
}

export function computeBadges(
  strategy: Strategy,
  records: MonthlyRecord[],
  balanceCount: number,
): Badge[] {
  const { best, completedMonths } = computeStreak(strategy, records)
  const capBuckets = strategy.buckets.filter((b) => b.targetCap != null)
  const capDone = capBuckets.filter((b) => {
    const filled = records.reduce((s, r) => {
      const c = r.checks[b.id]
      return c?.done ? s + (c.contributedAmount ?? b.monthlyAmount) : s
    }, 0)
    return filled >= (b.targetCap ?? Infinity)
  }).length

  return [
    {
      id: 'first-step',
      emoji: '🌱',
      label: '첫 걸음',
      description: '첫 달을 완주했어요',
      earned: completedMonths >= 1,
    },
    {
      id: 'streak-3',
      emoji: '🔥',
      label: '꾸준함',
      description: '3개월 연속 완주',
      earned: best >= 3,
    },
    {
      id: 'streak-6',
      emoji: '🌳',
      label: '반년 달성',
      description: '6개월 연속 완주',
      earned: best >= 6,
    },
    {
      id: 'streak-12',
      emoji: '🏆',
      label: '1년 완주',
      description: '12개월 연속 완주',
      earned: best >= 12,
    },
    {
      id: 'cap-done',
      emoji: '🛡️',
      label: '목표 달성',
      description: '비상금 등 목표 항목을 채웠어요',
      earned: capDone >= 1,
    },
    {
      id: 'tracking',
      emoji: '📈',
      label: '기록 시작',
      description: '자산 잔액을 기록했어요',
      earned: balanceCount >= 1,
    },
  ]
}
