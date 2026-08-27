import { apiRequest } from './client'
import type { FarmAutomationStatus } from './types'

const devicePath = (farmUid: string, deviceUid: string) => `/api/admin/farms/${encodeURIComponent(farmUid)}/devices/${encodeURIComponent(deviceUid)}`

export function getFarmAutomation(farmUid: string, deviceUid: string) {
  return apiRequest<FarmAutomationStatus>(`${devicePath(farmUid, deviceUid)}/automation`)
}

export function updateFarmAutomation(farmUid: string, deviceUid: string, enabled: boolean) {
  return apiRequest<FarmAutomationStatus>(`${devicePath(farmUid, deviceUid)}/automation`, { method: 'PATCH', body: JSON.stringify({ enabled }) })
}

export function runFarmAutomation(farmUid: string, deviceUid: string) {
  return apiRequest<FarmAutomationStatus>(`${devicePath(farmUid, deviceUid)}/automation/run`, { method: 'POST' })
}

export function commandPump(farmUid: string, deviceUid: string, state: 'on' | 'off') {
  return apiRequest(`${'/api/v1/farms'}/${encodeURIComponent(farmUid)}/devices/${encodeURIComponent(deviceUid)}/pump`, { method: 'POST', body: JSON.stringify({ state }), auth: false })
}

export function commandLed(farmUid: string, deviceUid: string, state: 'on' | 'off') {
  return apiRequest(`${'/api/v1/farms'}/${encodeURIComponent(farmUid)}/devices/${encodeURIComponent(deviceUid)}/led`, { method: 'POST', body: JSON.stringify({ state }), auth: false })
}
