import type { AppData } from '../types/model'
import { currentMonth } from './month'
import { monthProgress } from './progress'

export function notificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationSupported()) return 'denied'
  return Notification.requestPermission()
}

/**
 * 앱 로드 시 호출. 리마인더 조건을 충족하면 OS 알림을 1회 띄우고,
 * 이번 달에 다시 띄우지 않도록 lastReminderShownMonth 갱신값을 반환.
 * 반환값이 있으면 호출 측에서 settings를 업데이트해야 한다.
 */
export function maybeShowMonthlyReminder(
  data: AppData,
): { lastReminderShownMonth: string } | null {
  const { settings } = data
  if (!settings.reminderEnabled) return null
  if (!notificationSupported() || Notification.permission !== 'granted') return null

  const today = new Date()
  if (today.getDate() < settings.reminderDayOfMonth) return null

  const month = currentMonth(today)
  if (settings.lastReminderShownMonth === month) return null

  const strategy = data.strategies.find((s) => s.id === data.activeStrategyId)
  if (!strategy) return null

  const progress = monthProgress(strategy, data.records, month)
  if (progress.complete) return null

  try {
    new Notification('이번 달 할 일이 남아 있어요', {
      body: `${progress.total - progress.done}개 항목이 아직 남았어요. 잠깐이면 끝나요!`,
      icon: './icon.svg',
    })
  } catch {
    /* 무시 */
  }
  return { lastReminderShownMonth: month }
}

/** 이번 달 리마인더 인앱 배너를 보여줄지 여부 */
export function shouldShowReminderBanner(data: AppData): boolean {
  const { settings } = data
  if (!settings.reminderEnabled) return false
  if (new Date().getDate() < settings.reminderDayOfMonth) return false
  const strategy = data.strategies.find((s) => s.id === data.activeStrategyId)
  if (!strategy) return false
  return !monthProgress(strategy, data.records, currentMonth()).complete
}
