import { createContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthCredentials, RegisterInput } from '@/types/auth'
import { authApi } from '@/api/auth'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  /** True only while the initial session check on load is in flight. */
  isInitializing: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    authApi.getCurrentUser().then((restoredUser) => {
      setUser(restoredUser)
      setIsInitializing(false)
    })
  }, [])

  const login = useCallback(async (credentials: AuthCredentials) => {
    const loggedInUser = await authApi.login(credentials)
    setUser(loggedInUser)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const newUser = await authApi.register(input)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isInitializing,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
