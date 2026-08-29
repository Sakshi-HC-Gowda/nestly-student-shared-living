/**
 * Shaped to match what the future Spring Security/JWT backend will return,
 * so swapping the mock implementation in `api/auth.ts` for real HTTP calls
 * in Week 4 won't require changing this type or anything that consumes it.
 */
export interface User {
  id: string
  name: string
  email: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
