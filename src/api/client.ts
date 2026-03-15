/**
 * 带认证的 API 请求封装
 * 自动附加 Authorization，401 时尝试 refresh 后重试
 */

import { useAuthStore } from '@/stores/auth'

const API_BASE = '/api'

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<Response> {
  const authStore = useAuthStore()
  const token = authStore.accessToken

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401 && !retried && authStore.refreshTokenValue) {
    try {
      await authStore.refresh()
      return apiFetch(path, options, true)
    } catch {
      authStore.clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return res
}
