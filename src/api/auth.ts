import { apiClient, clearAuthToken, getAuthToken, setAuthToken } from '@/api/client'
import type { User, AuthCredentials, RegisterInput } from '@/types/auth'

const SESSION_USER_KEY = 'nestly.auth.user'

interface LoginResponse {
  token: string
  userId: number
  name: string
  email: string
}

interface RegisterResponse {
  id: number
  name: string
  email: string
  createdAt: string
}

function toUser(response: LoginResponse | RegisterResponse): User {
  return {
    id: String('userId' in response ? response.userId : response.id),
    name: response.name,
    email: response.email,
  }
}

function storeUser(user: User): void {
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem(SESSION_USER_KEY)
  if (!raw || !getAuthToken()) return null
  try {
    const parsed = JSON.parse(raw) as User
    return parsed.id && parsed.email ? parsed : null
  } catch {
    return null
  }
}

function clearSession(): void {
  clearAuthToken()
  localStorage.removeItem(SESSION_USER_KEY)
}

export const authApi = {
  async login(credentials: AuthCredentials): Promise<User> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    setAuthToken(response.token)
    const user = toUser(response)
    storeUser(user)
    return user
  },

  async register(input: RegisterInput): Promise<User> {
    await apiClient.post<RegisterResponse>('/auth/register', input)
    return this.login({ email: input.email, password: input.password })
  },

  async logout(): Promise<void> {
    clearSession()
  },

  async getCurrentUser(): Promise<User | null> {
    return readStoredUser()
  },
}
