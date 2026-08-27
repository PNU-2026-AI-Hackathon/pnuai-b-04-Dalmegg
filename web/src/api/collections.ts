import { apiRequest } from './client'
import type { CollectionRankingItem, CollectionRead, CollectionSummary, CollectionTrendPoint } from './types'

export function getCollectionSummary() {
  return apiRequest<CollectionSummary>('/api/collections/summary')
}

export function getCollectionTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  return apiRequest<CollectionTrendPoint[]>(`/api/collections/trends?period=${period}`)
}

export function getCollectionRankings() {
  return apiRequest<CollectionRankingItem[]>('/api/collections/rankings')
}

export function listPendingCollections() {
  return apiRequest<CollectionRead[]>('/api/collections/pending')
}

export function approveCollection(collectionId: number) {
  return apiRequest<CollectionRead>(`/api/collections/${collectionId}/approve`, { method: 'PATCH' })
}

export function rejectCollection(collectionId: number) {
  return apiRequest<CollectionRead>(`/api/collections/${collectionId}/reject`, { method: 'PATCH' })
}
