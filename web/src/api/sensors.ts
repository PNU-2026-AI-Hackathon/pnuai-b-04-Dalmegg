import { apiRequest } from './client'
import type { SensorLatestRead, SensorReadingRead, SmartFarmDeviceRead } from './types'

export function listSensorDevices() {
  return apiRequest<SmartFarmDeviceRead[]>('/api/admin/sensors/devices')
}

export function getLatestSensorReading(farmUid: string, deviceUid: string) {
  return apiRequest<SensorLatestRead>(`/api/admin/sensors/farms/${encodeURIComponent(farmUid)}/devices/${encodeURIComponent(deviceUid)}/readings/latest`)
}

export function listSensorReadings(farmUid: string, deviceUid: string, limit = 72) {
  return apiRequest<SensorReadingRead[]>(`/api/admin/sensors/farms/${encodeURIComponent(farmUid)}/devices/${encodeURIComponent(deviceUid)}/readings?limit=${limit}`)
}
