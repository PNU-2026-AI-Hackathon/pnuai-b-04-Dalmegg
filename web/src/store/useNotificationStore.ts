import { create } from 'zustand'
import { adminAlerts } from '../mock/dashboard'
import type { AdminAlert } from '../types/dashboard'

const NOTIFICATION_STORAGE_KEY = 'dalmegg.adminAlerts'

function readStoredAlerts(): AdminAlert[] {
  if (typeof window === 'undefined') {
    return adminAlerts
  }

  try {
    const storedValue = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    if (!storedValue) {
      return adminAlerts
    }

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? (parsedValue as AdminAlert[]) : adminAlerts
  } catch {
    window.localStorage.removeItem(NOTIFICATION_STORAGE_KEY)
    return adminAlerts
  }
}

function writeStoredAlerts(alerts: AdminAlert[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(alerts))
}

interface NotificationState {
  alerts: AdminAlert[]
  setAlerts: (alerts: AdminAlert[]) => void
  markAsRead: (alertId: number) => void
  markAllAsRead: () => void
  resetAlerts: () => void
}

export function getUnreadAlertCount(alerts: AdminAlert[]) {
  return alerts.filter((alert) => !alert.is_read).length
}

export const useNotificationStore = create<NotificationState>((set) => ({
  alerts: readStoredAlerts(),
  setAlerts: (incomingAlerts) => {
    set((state) => {
      const alerts = incomingAlerts.map((incomingAlert) => {
        const previousAlert = state.alerts.find((alert) => alert.id === incomingAlert.id)
        return previousAlert ? { ...incomingAlert, is_read: previousAlert.is_read } : incomingAlert
      })
      writeStoredAlerts(alerts)
      return { alerts }
    })
  },
  markAsRead: (alertId) => {
    set((state) => {
      const alerts = state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, is_read: true } : alert,
      )
      writeStoredAlerts(alerts)
      return { alerts }
    })
  },
  markAllAsRead: () => {
    set((state) => {
      const alerts = state.alerts.map((alert) => ({ ...alert, is_read: true }))
      writeStoredAlerts(alerts)
      return { alerts }
    })
  },
  resetAlerts: () => {
    writeStoredAlerts(adminAlerts)
    set({ alerts: adminAlerts })
  },
}))
