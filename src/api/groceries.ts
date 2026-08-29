import type { GroceryItem, CreateGroceryItemInput } from '@/types/grocery'
import { mockGroceryItems } from '@/data/mockData'

const MOCK_DELAY_MS = 350

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const groceriesApi = {
  async getItems(householdId: string): Promise<GroceryItem[]> {
    const items = mockGroceryItems.filter((item) => item.householdId === householdId)
    return delay(items)
  },

  async addItem(
    householdId: string,
    input: CreateGroceryItemInput,
    addedByUserId: string,
    addedByName: string,
  ): Promise<GroceryItem> {
    const item: GroceryItem = {
      id: `g_${Date.now()}`,
      householdId,
      name: input.name.trim(),
      quantity: input.quantity?.trim() || undefined,
      note: input.note?.trim() || undefined,
      purchased: false,
      addedByUserId,
      addedByName,
    }
    mockGroceryItems.push(item)
    return delay(item)
  },

  async updateItem(id: string, input: CreateGroceryItemInput): Promise<GroceryItem> {
    const item = mockGroceryItems.find((i) => i.id === id)
    if (!item) {
      return Promise.reject(new Error('Item not found.'))
    }
    item.name = input.name.trim()
    item.quantity = input.quantity?.trim() || undefined
    item.note = input.note?.trim() || undefined
    return delay(item)
  },

  async togglePurchased(id: string): Promise<GroceryItem> {
    const item = mockGroceryItems.find((i) => i.id === id)
    if (!item) {
      return Promise.reject(new Error('Item not found.'))
    }
    item.purchased = !item.purchased
    return delay(item)
  },

  async deleteItem(id: string): Promise<void> {
    const index = mockGroceryItems.findIndex((i) => i.id === id)
    if (index !== -1) mockGroceryItems.splice(index, 1)
    return delay(undefined)
  },
}
