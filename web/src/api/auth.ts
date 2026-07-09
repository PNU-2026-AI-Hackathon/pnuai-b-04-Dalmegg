import { apiRequest, clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from './client'
import type { AdminUserRead, TokenResponse } from './types'

export async function registerAdmin(input: { email: string; password: string; full_name: string }) {
  return apiRequest<AdminUserRead>('/api/admin/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  })
}

export async function loginAdmin(input: { email: string; password: string }) {
  const token = await apiRequest<TokenResponse>('/api/admin/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  })
  setAuthTokens(token.access_token, token.refresh_token)
  return token
}

export function getAdminMe() {
  return apiRequest<AdminUserRead>('/api/admin/auth/me')
}

export async function logoutAdmin() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!accessToken) {
    clearAuthTokens()
    return
  }

  try {
    await apiRequest<void>('/api/admin/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  } finally {
    clearAuthTokens()
  }
}
