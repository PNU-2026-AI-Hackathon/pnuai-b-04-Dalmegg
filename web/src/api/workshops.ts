import { apiRequest } from './client'
import type { WorkshopProgramCreate, WorkshopProgramRead } from './types'

export function createWorkshopProgram(input: WorkshopProgramCreate) {
  return apiRequest<WorkshopProgramRead>('/api/programs', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listWorkshopPrograms(shopId: number) {
  return apiRequest<WorkshopProgramRead[]>(`/api/programs?shop_id=${encodeURIComponent(shopId)}`, { auth: false })
}
