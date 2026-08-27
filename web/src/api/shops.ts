import { apiRequest } from './client'
import type { ShopCreate, ShopRead, ShopUpdate } from './types'

export function listShops(region?: string) {
  const searchParams = new URLSearchParams()

  if (region) {
    searchParams.set('region', region)
  }

  const query = searchParams.toString()
  return apiRequest<ShopRead[]>(`/api/shops${query ? `?${query}` : ''}`, { auth: false })
}

export function createShop(input: ShopCreate) {
  return apiRequest<ShopRead>('/api/shops', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateShop(shopId: number, input: ShopUpdate) {
  return apiRequest<ShopRead>(`/api/shops/${shopId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
