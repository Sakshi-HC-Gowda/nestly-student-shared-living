import { useContext } from 'react'
import { HouseholdContext } from '@/context/HouseholdContext'
import type { HouseholdContextValue } from '@/context/HouseholdContext'

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext)
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider')
  }
  return context
}
