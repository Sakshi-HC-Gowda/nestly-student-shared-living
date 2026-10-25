import { createContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Household } from '@/types/household'
import { householdsApi } from '@/api/households'
import { useAuth } from '@/hooks/useAuth'

const ACTIVE_HOUSEHOLD_KEY = 'nestly.activeHouseholdId'

export interface HouseholdContextValue {
  households: Household[]
  currentHousehold: Household | null
  hasHousehold: boolean
  isLoading: boolean
  error: string | null
  setCurrentHouseholdId: (id: string) => void
  refreshHouseholds: () => Promise<Household[]>
  /** Inserts a newly created/joined household and makes it the active one. Used from Phase 5 onward. */
  addHousehold: (household: Household) => void
  /** Replaces one household in state with an updated copy (e.g. after removing a member). */
  updateHousehold: (household: Household) => void
}

export const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined)

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isInitializing: isAuthInitializing } = useAuth()
  const [households, setHouseholds] = useState<Household[]>([])
  const [currentHouseholdId, setCurrentHouseholdIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHouseholds = useCallback(async (): Promise<Household[]> => {
    if (!user) {
      setHouseholds([])
      setIsLoading(false)
      return []
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await householdsApi.getHouseholds(user.id, user)
      setHouseholds(result)

      const storedId = localStorage.getItem(ACTIVE_HOUSEHOLD_KEY)
      const stillValid = result.some((h) => h.id === storedId)
      if (stillValid && storedId) {
        setCurrentHouseholdIdState(storedId)
      } else if (result.length > 0) {
        setCurrentHouseholdIdState(result[0].id)
      } else {
        setCurrentHouseholdIdState(null)
      }
      return result
    } catch {
      setError('Could not load your households.')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isAuthInitializing) {
      return
    }
    if (isAuthenticated) {
      loadHouseholds()
    } else {
      setHouseholds([])
      setCurrentHouseholdIdState(null)
      localStorage.removeItem(ACTIVE_HOUSEHOLD_KEY)
      setIsLoading(false)
    }
  }, [isAuthInitializing, isAuthenticated, loadHouseholds])

  const setCurrentHouseholdId = useCallback((id: string) => {
    setCurrentHouseholdIdState(id)
    localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, id)
  }, [])

  const addHousehold = useCallback((household: Household) => {
    setHouseholds((prev) => [...prev, household])
    setCurrentHouseholdId(household.id)
  }, [setCurrentHouseholdId])

  const updateHousehold = useCallback((household: Household) => {
    setHouseholds((prev) => prev.map((h) => (h.id === household.id ? household : h)))
  }, [])

  const currentHousehold = useMemo(
    () => households.find((h) => h.id === currentHouseholdId) ?? null,
    [households, currentHouseholdId],
  )

  const value: HouseholdContextValue = {
    households,
    currentHousehold,
    hasHousehold: households.length > 0,
    isLoading,
    error,
    setCurrentHouseholdId,
    refreshHouseholds: loadHouseholds,
    addHousehold,
    updateHousehold,
  }

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>
}
