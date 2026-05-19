import type { MonthlyRecord, Strategy } from '../types/model'
import { addMonths, compareMonth, currentMonth } from './month'
import { monthProgress } from './progress'

export type SlotStatus = 'past-complete' | 'past-missed' | 'current' | 'future'

export interface RoadmapSlot {
  index: number
  month: string
  year: number
  status: SlotStatus
}

export function buildRoadmap(
  strategy: Strategy,
  records: MonthlyRecord[],
): RoadmapSlot[] {
  const now = currentMonth()
  const slots: RoadmapSlot[] = []
  for (let i = 0; i < strategy.durationMonths; i += 1) {
    const month = addMonths(strategy.startMonth, i)
    const cmp = compareMonth(month, now)
    let status: SlotStatus
    if (cmp > 0) {
      status = 'future'
    } else if (cmp === 0) {
      status = 'current'
    } else {
      status = monthProgress(strategy, records, month).complete
        ? 'past-complete'
        : 'past-missed'
    }
    slots.push({
      index: i,
      month,
      year: Number(month.slice(0, 4)),
      status,
    })
  }
  return slots
}

export interface RoadmapSummary {
  elapsed: number
  total: number
  elapsedRatio: number
  monthsLeft: number
}

export function roadmapSummary(strategy: Strategy): RoadmapSummary {
  const now = currentMonth()
  const elapsed = Math.min(
    Math.max(0, compareMonth(now, strategy.startMonth) + 1),
    strategy.durationMonths,
  )
  return {
    elapsed,
    total: strategy.durationMonths,
    elapsedRatio: elapsed / strategy.durationMonths,
    monthsLeft: Math.max(0, strategy.durationMonths - elapsed),
  }
}
