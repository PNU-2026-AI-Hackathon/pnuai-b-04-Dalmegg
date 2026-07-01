import type { LucideIcon } from 'lucide-react'

export type FarmStatus = 'optimal' | 'attention' | 'offline'

export interface FarmZone {
  id: string
  name: string
  crop: string
  temperature: number
  humidity: number
  soilMoisture: number
  status: FarmStatus
}

export interface MetricCardData {
  label: string
  value: string
  unit?: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  tone: 'green' | 'amber' | 'blue' | 'violet'
}

export interface WeeklyEnvironment {
  day: string
  temperature: number
  humidity: number
}

export interface CircularActivity {
  id: number
  title: string
  description: string
  time: string
  type: 'collect' | 'process' | 'supply'
}

export interface CropProgress {
  name: string
  variety: string
  progress: number
  harvestDate: string
  color: string
}

export type SensorStatus = 'normal' | 'warning' | 'danger'

export interface SensorData {
  id: 'temperature' | 'humidity' | 'light' | 'soil'
  name: string
  value: number
  unit: string
  normalRange: string
  status: SensorStatus
  updatedAt: string
}

export interface SensorHistory {
  time: string
  temperature: number
  humidity: number
  light: number
  soil: number
}

export interface CollectionData {
  day: string
  amount: number
}

export interface FlowerInventory {
  name: string
  stock: number
  target: number
}

export interface AdminAlert {
  id: number
  title: string
  description: string
  time: string
  type: 'sensor' | 'reservation' | 'inventory'
}

export type InventoryStatus = 'sufficient' | 'low' | 'soldout'

export interface FlowerInventoryItem {
  id: number
  name: string
  stock: number
  price: number
  status: InventoryStatus
}

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled'

export interface Reservation {
  id: number
  customerName: string
  phone: string
  programName: string
  date: string
  time: string
  participants: number
  status: ReservationStatus
  note: string
}

export interface CollectionRanking {
  rank: number
  name: string
  amount: number
  points: number
}
