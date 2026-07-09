import { apiRequest } from './client'
import type { CollectionRankingItem, CollectionSummary, CollectionTrendPoint } from './types'

export function getCollectionSummary() {
  return apiRequest<CollectionSummary>('/api/collections/summary')
}

export function getCollectionTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  return apiRequest<CollectionTrendPoint[]>(`/api/collections/trends?period=${period}`)
}

export function getCollectionRankings() {
  return apiRequest<CollectionRankingItem[]>('/api/collections/rankings')
}
