import type { Bucket, ISOMonth, MonthlyRecord, Strategy } from '../types/model'
import { compareMonth } from './month'

/** 한 월의 한 버킷이 실제로 적립한 금액 (체크 안 됐으면 0) */
function contributionOf(record: MonthlyRecord | undefined, bucket: Bucket): number {
  const check = record?.checks[bucket.id]
  if (!check?.done) return 0
  return check.contributedAmount ?? bucket.monthlyAmount
}

/** 버킷의 전체 누적 적립액 */
export function bucketTotalFilled(bucket: Bucket, records: MonthlyRecord[]): number {
  return records.reduce((sum, r) => sum + contributionOf(r, bucket), 0)
}

/** 지정한 월 이전(미포함)까지의 누적 적립액 */
export function bucketFilledBefore(
  bucket: Bucket,
  records: MonthlyRecord[],
  month: ISOMonth,
): number {
  return records
    .filter((r) => compareMonth(r.month, month) < 0)
    .reduce((sum, r) => sum + contributionOf(r, bucket), 0)
}

/** 목표 상한을 이미 채웠는가 */
export function isBucketCapReached(bucket: Bucket, records: MonthlyRecord[]): boolean {
  if (bucket.targetCap == null) return false
  return bucketTotalFilled(bucket, records) >= bucket.targetCap
}

/** 해당 월에 이 버킷이 아직 적립 대상인가 (목표 채우면 비활성) */
export function isBucketActiveInMonth(
  bucket: Bucket,
  records: MonthlyRecord[],
  month: ISOMonth,
): boolean {
  if (bucket.targetCap == null) return true
  return bucketFilledBefore(bucket, records, month) < bucket.targetCap
}

/** 해당 월에 실행해야 할 버킷 목록 (order 정렬) */
export function activeBucketsForMonth(
  strategy: Strategy,
  records: MonthlyRecord[],
  month: ISOMonth,
): Bucket[] {
  return [...strategy.buckets]
    .sort((a, b) => a.order - b.order)
    .filter((b) => isBucketActiveInMonth(b, records, month))
}

export interface MonthProgress {
  total: number
  done: number
  complete: boolean
  ratio: number
}

/** 해당 월의 완료 현황 */
export function monthProgress(
  strategy: Strategy,
  records: MonthlyRecord[],
  month: ISOMonth,
): MonthProgress {
  const active = activeBucketsForMonth(strategy, records, month)
  const record = records.find((r) => r.month === month)
  const done = active.filter((b) => record?.checks[b.id]?.done).length
  const total = active.length
  return {
    total,
    done,
    complete: total > 0 && done === total,
    ratio: total === 0 ? 1 : done / total,
  }
}

export interface BucketProgress {
  bucket: Bucket
  filled: number
  capReached: boolean
  ratio: number // targetCap 대비 (cap 없으면 0)
}

export function bucketProgress(
  bucket: Bucket,
  records: MonthlyRecord[],
): BucketProgress {
  const filled = bucketTotalFilled(bucket, records)
  const capReached = bucket.targetCap != null && filled >= bucket.targetCap
  return {
    bucket,
    filled,
    capReached,
    ratio: bucket.targetCap ? Math.min(filled / bucket.targetCap, 1) : 0,
  }
}
