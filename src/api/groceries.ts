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

  async updateItem(_id: string, _input: CreateGroceryItemInput): Promise<GroceryItem> {
    throw new Error('Editing grocery items is not supported by the backend yet.')
  },

  async togglePurchased(_id: string): Promise<GroceryItem> {
    throw new Error('Updating grocery purchase status is not supported by the backend yet.')
  },

  async deleteItem(_id: string): Promise<void> {
    throw new Error('Deleting grocery items is not supported by the backend yet.')
  },
}
