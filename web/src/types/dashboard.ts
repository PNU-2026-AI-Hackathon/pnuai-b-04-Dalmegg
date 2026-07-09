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
  period: string
  weight_kg: number
  collection_count: number
}

export interface FlowerInventory {
  name: string
  stock_quantity: number
}

export interface AdminAlert {
  id: number
  type: 'sensor' | 'reservation' | 'stock' | string
  title: string
  message: string
  severity: 'info' | 'warning' | 'danger' | string
  is_read: boolean
}

export type InventoryStatus = 'sufficient' | 'low' | 'soldout'

export interface FlowerInventoryItem {
  id: number
  shop_id: number
  name: string
  description: string
  color: string
  price: number
  stock_quantity: number
  image_url?: string
}

export type ReservationStatus = 'reserved' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Reservation {
  id: number
  user_id: number
  program_id: number
  participant_count: number
  total_amount: number
  status: ReservationStatus
  created_at: string
  user_email: string
  user_full_name: string
  program_title: string
  shop_id: number
}

export interface CollectionRanking {
  rank: number
  user_id: number
  email: string
  full_name: string
  total_weight_kg: number
  reward_points: number
  contribution_count: number
}
