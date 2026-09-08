import {
  adminAppointmentNotificationKindLabel,
  formatAdminAppointmentNotificationTime,
  type AdminAppointmentNotificationItem,
} from './adminNotifications.js'
import { formatDisplayDate } from '../time/index.js'

export function requestAdminNotificationPermission(): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'default') return
  void Notification.requestPermission()
}

function shouldShowBrowserNotification(): boolean {
  if (typeof document === 'undefined') return false
  return document.hidden || !document.hasFocus()
}

export function showAdminBrowserNotifications(
  items: AdminAppointmentNotificationItem[],
  options?: { icon?: string },
): void {
  if (items.length === 0) return
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (!shouldShowBrowserNotification()) return

  const icon = options?.icon ?? '/favicon.svg'

  for (const item of items) {
    const title = adminAppointmentNotificationKindLabel(item.kind)
    const time = formatAdminAppointmentNotificationTime(item.startTime)
    const date = formatDisplayDate(item.date)
    const detail =
      item.treatmentCount && item.treatmentCount > 1
        ? `${item.treatmentCount} tratamientos · ${item.staffName}`
        : `${item.serviceName} · ${item.staffName}`
    const body = `${item.customerName} · ${detail} — ${date} ${time}`
    new Notification(title, {
      body,
      icon,
      tag: item.key,
    })
  }
}
