import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  login as apiLogin,
  register as apiRegister,
  refreshToken,
  logout as apiLogout,
  fetchMe,
  type UserInfo,
  type AuthTokens,
} from '@/api/auth'

const AUTH_KEY = 'auth'

function loadStored() {
  try {
    const s = localStorage.getItem(AUTH_KEY)
    if (!s) return null
    return JSON.parse(s) as { accessToken: string; refreshTokenValue: string; user?: UserInfo }
  } catch {
    return null
  }
}

function saveStored(data: { accessToken: string; refreshTokenValue: string; user?: UserInfo } | null) {
  if (!data) {
    localStorage.removeItem(AUTH_KEY)
    return
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadStored()
  const user = ref<UserInfo | null>(stored?.user ?? null)
  const accessToken = ref<string | null>(stored?.accessToken ?? null)
  const refreshTokenValue = ref<string | null>(stored?.refreshTokenValue ?? null)

  const isAuthenticated = computed(() => !!accessToken.value)

  watch(
    [accessToken, refreshTokenValue, user],
    ([at, rt, u]) => {
      if (at && rt) {
        saveStored({ accessToken: at, refreshTokenValue: rt, user: u ?? undefined })
      } else {
        saveStored(null)
      }
    },
    { deep: true }
  )

  function setTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshTokenValue.value = tokens.refreshToken
    user.value = null
  }

  function setUser(u: UserInfo) {
    user.value = u
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshTokenValue.value = null
    saveStored(null)
  }

  async function login(username: string, password: string) {
    const tokens = await apiLogin(username, password)
    setTokens(tokens)
    await fetchUser()
  }

  async function register(username: string, password: string) {
    const tokens = await apiRegister(username, password)
    setTokens(tokens)
    await fetchUser()
  }

  async function fetchUser() {
    if (!accessToken.value) return
    try {
      const u = await fetchMe(accessToken.value)
      setUser(u)
    } catch {
      clearAuth()
    }
  }

  async function refresh() {
    if (!refreshTokenValue.value) throw new Error('无刷新令牌')
    const tokens = await refreshToken(refreshTokenValue.value)
    setTokens(tokens)
    await fetchUser()
  }

  async function logout() {
    if (accessToken.value) {
      await apiLogout(accessToken.value, refreshTokenValue.value ?? undefined)
    }
    clearAuth()
  }

  return {
    user,
    accessToken,
    refreshTokenValue,
    isAuthenticated,
    login,
    register,
    fetchUser,
    refresh,
    logout,
    setTokens,
    clearAuth,
  }
})
