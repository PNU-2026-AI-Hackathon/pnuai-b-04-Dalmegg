import { apiRequest } from './client'
import type { FlowerInventoryItem } from '../types/dashboard'

export interface FlowerFormInput {
  shop_id: number
  name: string
  description: string
  color: string
  price: number
  stock_quantity: number
  image_file?: File
}

export function listFlowers(shopId?: number) {
  const searchParams = new URLSearchParams()

  if (shopId) {
    searchParams.set('shop_id', String(shopId))
  }

  const search = searchParams.toString()
  return apiRequest<FlowerInventoryItem[]>(`/api/flowers${search ? `?${search}` : ''}`, { auth: false })
}

export function createFlower(input: FlowerFormInput) {
  const formData = new FormData()
  formData.set('shop_id', String(input.shop_id))
  formData.set('name', input.name)
  formData.set('price', String(input.price))
  formData.set('stock_quantity', String(input.stock_quantity))

  if (input.description) {
    formData.set('description', input.description)
  }

  if (input.color) {
    formData.set('color', input.color)
  }

  if (input.image_file) {
    formData.set('image', input.image_file)
  }

  return apiRequest<FlowerInventoryItem>('/api/flowers', {
    method: 'POST',
    body: formData,
  })
}

export function deleteFlower(flowerId: number) {
  return apiRequest<void>(`/api/flowers/${flowerId}`, {
    method: 'DELETE',
  })
}

export async function updateFlower(flowerId: number, input: FlowerFormInput, previousStockQuantity: number) {
  let updatedFlower = await apiRequest<FlowerInventoryItem>(`/api/flowers/${flowerId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      color: input.color,
      price: input.price,
    }),
  })

  if (input.stock_quantity !== previousStockQuantity) {
    updatedFlower = await apiRequest<FlowerInventoryItem>(`/api/flowers/${flowerId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: input.stock_quantity }),
    })
  }

  if (input.image_file) {
    const formData = new FormData()
    formData.set('image', input.image_file)
    updatedFlower = await apiRequest<FlowerInventoryItem>(`/api/flowers/${flowerId}/image`, {
      method: 'PATCH',
      body: formData,
    })
  }

  return updatedFlower
}
