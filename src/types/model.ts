export type ISOMonth = string // "2026-05"
export type ISODate = string // "2026-05-19"

export type AccountType =
  | 'cma'
  | 'isa'
  | 'etf'
  | 'pension'
  | 'irp'
  | 'parking'
  | 'other'

export interface Bucket {
  id: string
  order: number
  name: string
  accountType: AccountType
  monthlyAmount: number // 원
  targetCap?: number // 원 — 채우면 중단
  assetNote?: string
}

export type PresetId = 'growth' | 'dividend'

export interface Strategy {
  id: string
  name: string
  basedOnPreset?: PresetId
  durationMonths: number
  startMonth: ISOMonth
  buckets: Bucket[]
}

export interface CheckState {
  done: boolean
  contributedAmount?: number
  completedAt?: ISODate
}

export interface MonthlyRecord {
  month: ISOMonth
  checks: Record<string, CheckState> // bucketId -> state
}

export interface BalanceEntry {
  id: string
  date: ISODate
  totalAssets: number // 원
  note?: string
}

export interface Settings {
  reminderEnabled: boolean
  reminderDayOfMonth: number // 1-28
  notificationPermissionAsked: boolean
  lastReminderShownMonth?: ISOMonth
}

export interface AppData {
  schemaVersion: number
  activeStrategyId?: string
  strategies: Strategy[]
  records: MonthlyRecord[]
  balances: BalanceEntry[]
  settings: Settings
}
