import { apiClient } from '@/api/client'
import type { GroceryItem, CreateGroceryItemInput } from '@/types/grocery'

interface BackendGrocery {
  id: number
  name: string
  quantity: string
  estimatedPrice?: number
  status: 'PENDING' | 'PURCHASED'
  householdId: number
  addedByUserId: number
  addedByName: string
  createdAt: string
}

function toGroceryItem(response: BackendGrocery): GroceryItem {
  return {
    id: String(response.id),
    householdId: String(response.householdId),
    name: response.name,
    quantity: response.quantity,
    note: response.estimatedPrice === undefined || response.estimatedPrice === null ? undefined : `Est. Rs ${response.estimatedPrice}`,
    purchased: response.status === 'PURCHASED',
    addedByUserId: String(response.addedByUserId),
    addedByName: response.addedByName,
  }
}

export const groceriesApi = {
  async getItems(householdId: string): Promise<GroceryItem[]> {
    const items = await apiClient.get<BackendGrocery[]>(`/groceries/household/${householdId}`)
    return items.map(toGroceryItem)
  },

  async addItem(
    householdId: string,
    input: CreateGroceryItemInput,
    _addedByUserId: string,
    _addedByName: string,
  ): Promise<GroceryItem> {
    const item = await apiClient.post<BackendGrocery>('/groceries', {
      name: input.name.trim(),
      quantity: input.quantity?.trim() || '1',
      estimatedPrice: undefined,
      householdId: Number(householdId),
    })
    return toGroceryItem(item)
  },

  async updateItem(id: string, input: CreateGroceryItemInput): Promise<GroceryItem> {
    const item = await apiClient.put<BackendGrocery>(`/groceries/${id}`, {
      name: input.name.trim(),
      quantity: input.quantity?.trim() || '1',
    })
    return toGroceryItem(item)
  },

  async togglePurchased(id: string): Promise<GroceryItem> {
    const item = await apiClient.put<BackendGrocery>(`/groceries/${id}/toggle`)
    return toGroceryItem(item)
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete<void>(`/groceries/${id}`)
  },
}
