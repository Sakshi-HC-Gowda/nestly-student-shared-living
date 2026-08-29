import type { User, AuthCredentials, RegisterInput } from '@/types/auth'
import { mockUsers, DEMO_USER_ID } from '@/data/mockData'

const SESSION_KEY = 'nestly.session.userId'
const MOCK_DELAY_MS = 500

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Mock auth for Week 2. Every function is async and returns the same
 * shape a real `fetch('/api/auth/...')` call would, so `AuthContext` can
 * swap this module for real HTTP calls in Week 4 without changing itself.
 */
export const authApi = {
  async login({ email }: AuthCredentials): Promise<User> {
    // Week 2: any password is accepted for any known email, or the demo
    // user is returned so the flow always has something to show.
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return Promise.reject(new Error('No account found with that email.'))
    }
    localStorage.setItem(SESSION_KEY, user.id)
    return delay(user)
  },

  async register({ name, email }: RegisterInput): Promise<User> {
    const existing = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return Promise.reject(new Error('An account with that email already exists.'))
    }
    const newUser: User = { id: `u_${Date.now()}`, name, email }
    mockUsers.push(newUser)
    localStorage.setItem(SESSION_KEY, newUser.id)
    return delay(newUser)
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY)
    return delay(undefined, 150)
  },

  /** Restores the session on page reload — stands in for a "/me" JWT check. */
  async getCurrentUser(): Promise<User | null> {
    const storedId = localStorage.getItem(SESSION_KEY)
    if (!storedId) return delay(null, 150)
    const user = mockUsers.find((u) => u.id === storedId)
    return delay(user ?? null, 150)
  },

  /** Convenience for demoing the app without filling in a form. */
  async loginAsDemoUser(): Promise<User> {
    const user = mockUsers.find((u) => u.id === DEMO_USER_ID)!
    localStorage.setItem(SESSION_KEY, user.id)
    return delay(user)
  },
}
