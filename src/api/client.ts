const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

const TOKEN_KEY = 'nestly.auth.token'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function getFriendlyStatusMessage(status: number, path: string): string {
  if (status === 400) return 'Please check the information and try again.'
  if (status === 401) {
    return path === '/auth/login'
      ? 'Invalid email or password.'
      : 'Your session has expired. Please log in again.'
  }
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 404) return 'The requested item could not be found.'
  if (status === 409) return 'This conflicts with existing data.'
  if (status >= 500) return 'The server is having trouble. Please try again later.'
  return 'Something went wrong. Please try again.'
}

function extractErrorMessage(body: unknown, status: number, path: string): string {
  if (body && typeof body === 'object') {
    if ('errors' in body && body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors)[0]
      if (typeof first === 'string') return first
    }
    if ('fieldErrors' in body && body.fieldErrors && typeof body.fieldErrors === 'object') {
      const first = Object.values(body.fieldErrors)[0]
      if (typeof first === 'string') return first
    }
    if ('error' in body && typeof body.error === 'string') return body.error
    if ('message' in body && typeof body.message === 'string' && body.message !== 'Validation failed') {
      return body.message
    }
    if ('message' in body && typeof body.message === 'string') return body.message
  }
  return getFriendlyStatusMessage(status, path)
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(0, 'Could not reach the backend. Make sure the Spring Boot server is running.')
  }

  const body = await parseResponse(response)

  if (!response.ok) {
    // Only clear the auth token on 401 if:
    // 1. We actually sent a token with this request
    // 2. The token in localStorage is still the same one we sent (no newer login happened)
    // 3. The request was NOT to the login endpoint (login 401 = bad credentials, not expired session)
    if (response.status === 401 && token && path !== '/auth/login') {
      const currentToken = getAuthToken()
      if (currentToken === token) {
        clearAuthToken()
      }
      // If currentToken differs from token, a concurrent login refreshed it — don't clear.
    }
    throw new ApiError(response.status, extractErrorMessage(body, response.status, path), body)
  }

  return body as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
