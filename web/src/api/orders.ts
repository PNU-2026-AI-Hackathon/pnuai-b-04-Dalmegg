import { apiRequest } from './client'
import type { AdminOrderRead } from './types'

export function listAdminOrders(shopId: number) {
  return apiRequest<AdminOrderRead[]>(`/api/admin/orders?shop_id=${encodeURIComponent(shopId)}`)
}
