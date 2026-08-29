export interface GroceryItem {
  id: string
  householdId: string
  name: string
  quantity?: string
  note?: string
  purchased: boolean
  addedByUserId: string
  addedByName: string
}

export interface CreateGroceryItemInput {
  name: string
  quantity?: string
  note?: string
}
