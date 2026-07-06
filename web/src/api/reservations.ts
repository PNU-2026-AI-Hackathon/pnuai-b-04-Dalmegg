import { apiRequest } from './client'
import type { Reservation, ReservationStatus } from '../types/dashboard'

interface AdminReservationParams {
  shopId?: number
  status?: ReservationStatus
  query?: string
}

export function listAdminReservations({ shopId, status, query }: AdminReservationParams = {}) {
  const searchParams = new URLSearchParams()

  if (shopId) {
    searchParams.set('shop_id', String(shopId))
  }

  if (status) {
    searchParams.set('status', status)
  }

  if (query) {
    searchParams.set('q', query)
  }

  const search = searchParams.toString()
  return apiRequest<Reservation[]>(`/api/admin/reservations${search ? `?${search}` : ''}`)
}
