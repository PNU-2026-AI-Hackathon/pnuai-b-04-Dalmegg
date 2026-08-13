const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const ACCESS_TOKEN_KEY = 'dalmegg.accessToken'
const REFRESH_TOKEN_KEY = 'dalmegg.refreshToken'

interface ApiRequestOptions extends RequestInit {
  auth?: boolean
}

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : `API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function getUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

export function getAssetUrl(path?: string | null) {
  if (!path) {
    return undefined
  }

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  return getUrl(path)
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(accessToken: string, refreshToken?: string | null) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearAuthTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return false
  }

  const response = await fetch(getUrl('/api/admin/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    clearAuthTokens()
    return false
  }

  const token = await response.json() as { access_token: string; refresh_token?: string | null }
  setAuthTokens(token.access_token, token.refresh_token)
  return true
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, headers, body, ...requestOptions } = options
  const requestHeaders = new Headers(headers)

  if (!(body instanceof FormData) && body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const accessToken = getAccessToken()

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`)
    } else if (await refreshAccessToken()) {
      const refreshedAccessToken = getAccessToken()

      if (refreshedAccessToken) {
        requestHeaders.set('Authorization', `Bearer ${refreshedAccessToken}`)
      }
    } else {
      throw new ApiError(401, 'Missing access token.')
    }
  }

  const response = await fetch(getUrl(path), {
    ...requestOptions,
    body,
    headers: requestHeaders,
  })

  if (response.status === 401 && auth && await refreshAccessToken()) {
    return apiRequest<T>(path, options)
  }

  const parsedResponse = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(response.status, parsedResponse)
  }

  return parsedResponse as T
}
