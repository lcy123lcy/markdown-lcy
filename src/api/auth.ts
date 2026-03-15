/**
 * 认证 API 服务
 */

const API_BASE = '/api'

export interface UserInfo {
  id: string
  username: string
  role: 'USER' | 'ADMIN'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export async function login(
  username: string,
  password: string
): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? '登录失败')
  }
  return res.json()
}

export async function register(
  username: string,
  password: string
): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? '注册失败')
  }
  return res.json()
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) throw new Error('刷新令牌失败')
  return res.json()
}

export async function logout(accessToken: string, refreshToken?: string): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {})
}

export async function fetchMe(accessToken: string): Promise<UserInfo> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('获取用户信息失败')
  return res.json()
}
