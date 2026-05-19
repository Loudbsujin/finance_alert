import type { AppData } from '../types/model'

export const STORAGE_KEY = 'finance_alert_v1'
export const CURRENT_SCHEMA_VERSION = 1

export function defaultAppData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeStrategyId: undefined,
    strategies: [],
    records: [],
    balances: [],
    settings: {
      reminderEnabled: false,
      reminderDayOfMonth: 25,
      notificationPermissionAsked: false,
    },
  }
}

/** 저장된 raw 데이터를 현재 스키마로 변환. 손상되면 기본값 반환. */
export function migrate(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return defaultAppData()
  const data = raw as Partial<AppData>
  const base = defaultAppData()

  // 미래 스키마 버전 분기를 위한 자리. 현재는 v1만 존재.
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeStrategyId: data.activeStrategyId,
    strategies: Array.isArray(data.strategies) ? data.strategies : base.strategies,
    records: Array.isArray(data.records) ? data.records : base.records,
    balances: Array.isArray(data.balances) ? data.balances : base.balances,
    settings: { ...base.settings, ...(data.settings ?? {}) },
  }
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAppData()
    return migrate(JSON.parse(raw))
  } catch {
    return defaultAppData()
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 용량 초과 등 — 조용히 무시 (개인용 앱, 데이터 양이 작음)
  }
}
