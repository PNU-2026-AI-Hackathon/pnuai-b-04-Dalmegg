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

export interface DashboardAlertRead {
  id: number
  type: 'sensor' | 'reservation' | 'stock'
  title: string
  message: string
  severity: 'info' | 'warning' | 'danger'
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

export interface CollectionRankingItem {
  rank: number
  user_id: number
  email: string
  full_name: string | null
  total_weight_kg: number
  reward_points: number
  contribution_count: number
}
