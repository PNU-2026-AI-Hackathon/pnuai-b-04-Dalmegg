export interface TokenResponse {
  access_token: string
  refresh_token?: string | null
  token_type: string
}

export interface AdminUserRead {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
}

export interface ShopRead {
  id: number
  admin_id: number
  name: string
  region: string
  address: string
  phone: string | null
  description: string | null
  average_rating: number
  review_count: number
}

export interface ShopCreate {
  name: string
  region: string
  address: string
  phone?: string | null
  description?: string | null
}

export interface ShopUpdate {
  name?: string
  region?: string
  address?: string
  phone?: string | null
  description?: string | null
}

export interface DashboardAlertRead {
  id: number
  type: 'sensor' | 'reservation' | 'stock' | string
  title: string
  message: string
  severity: 'info' | 'warning' | 'danger' | string
  is_read: boolean
}

export interface DashboardStockSummary {
  total_flower_types: number
  total_stock_quantity: number
  low_stock_count: number
  out_of_stock_count: number
}

export interface CollectionTrendPoint {
  period: string
  weight_kg: number
  collection_count: number
}

export interface DashboardSummary {
  today_eggshell_kg: number
  accumulated_circulation_kg: number
  growing_flower_count: number
  saved_water_liters: number
  recent_alerts: DashboardAlertRead[]
  stock_summary: DashboardStockSummary
  collection_stats: CollectionTrendPoint[]
}

export interface CollectionSummary {
  today_weight_kg: number
  total_weight_kg: number
  total_saved_co2_kg: number
  total_reward_points: number
  participant_count: number
  collection_count: number
}

export interface CollectionRead {
  id: number
  user_id: number
  weight_kg: number | string
  saved_co2_kg: number | string
  reward_points: number
  memo: string | null
  image_url: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  reviewed_by_admin_id: number | null
  reviewed_at: string | null
  created_at: string
}

export interface SmartFarmDeviceRead {
  id: number
  farm_uid: string
  device_uid: string
  name: string | null
  last_seen_at: string | null
}

export interface SensorReadingRead {
  id: number
  message_id: string
  temperature_c: number | null
  humidity_pct: number | null
  soil_moisture_pct: number | null
  light_lux: number | null
  water_level_pct: number | null
  measured_at: string
  received_at: string
}

export interface SensorLatestRead extends SensorReadingRead {
  device: SmartFarmDeviceRead
}

export interface CollectionRankingItem {
  rank: number
  user_id: number
  email: string
  full_name: string | null
  total_weight_kg: number
  reward_points: number
  contribution_count: number
}

export interface AdminOrderItemRead {
  id: number
  flower_id: number
  quantity: number
  unit_price: number
  line_amount: number
  flower_name?: string
}

export interface AdminOrderRead {
  id: number
  user_id: number
  user_email: string
  user_full_name: string | null
  total_amount: number
  status: string
  created_at: string
  items: AdminOrderItemRead[]
}

export interface WorkshopProgramRead {
  id: number
  shop_id: number
  title: string
  description: string | null
  materials: string | null
  starts_at: string
  duration_minutes: number
  capacity: number
  booked_count: number
  remaining_seats: number
  price_per_person: number
}

export interface WorkshopProgramCreate {
  shop_id: number
  title: string
  description?: string | null
  materials?: string | null
  starts_at: string
  duration_minutes: number
  capacity: number
  price_per_person: number
}
