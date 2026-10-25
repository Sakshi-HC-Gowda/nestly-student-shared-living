import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiClient, ApiError, setAuthToken, clearAuthToken, getAuthToken } from '@/api/client'

describe('apiClient and ApiError', () => {
  beforeEach(() => {
    clearAuthToken()
    vi.restoreAllMocks()
  })

  it('includes Authorization header when token exists', async () => {
    setAuthToken('test-token-123')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true })),
    })
    globalThis.fetch = fetchMock

    await apiClient.get('/test-endpoint')

    expect(fetchMock).toHaveBeenCalled()
    const callArgs = fetchMock.mock.calls[0]
    const headers = callArgs[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer test-token-123')
  })

  it('handles 400 Bad Request with field errors message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            message: 'Validation failed',
            fieldErrors: { description: 'Description is required' },
          }),
        ),
    })

    await expect(apiClient.get('/test')).rejects.toThrow(ApiError)
    try {
      await apiClient.get('/test')
    } catch (err) {
      const error = err as ApiError
      expect(error.status).toBe(400)
      expect(error.message).toBe('Description is required')
    }
  })

  it('clears auth token on 401 when token was sent for non-login route', async () => {
    setAuthToken('expired-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ error: 'Unauthorized' })),
    })

    await expect(apiClient.get('/expenses/household/1')).rejects.toThrow(ApiError)
    expect(getAuthToken()).toBeNull()
  })

  it('does NOT clear auth token on 401 for login route', async () => {
    setAuthToken('existing-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ error: 'Invalid credentials' })),
    })

    await expect(apiClient.post('/auth/login', { email: 'a@b.com', password: 'bad' })).rejects.toThrow(ApiError)
    expect(getAuthToken()).toBe('existing-token')
  })

  it('handles 403 Forbidden with friendly message when body has no message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve(''),
    })

    try {
      await apiClient.get('/expenses/household/99')
    } catch (err) {
      const error = err as ApiError
      expect(error.status).toBe(403)
      expect(error.message).toBe('You do not have permission to do that.')
    }
  })

  it('handles network failure with helpful message', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'))

    await expect(apiClient.get('/chores')).rejects.toThrow(
      'Could not reach the backend. Make sure the Spring Boot server is running.',
    )
  })
})
