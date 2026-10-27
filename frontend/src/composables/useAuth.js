import { ref, computed } from 'vue'
import { getMe, getToken, login, logout, refreshSession } from '../services/auth.js'

const token = ref(getToken())
const user = ref(null)
const loading = ref(false)
let bootstrapped = false

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canManageContent = computed(() => ['admin', 'editor'].includes(user.value?.role))

  async function signIn(credentials) {
    loading.value = true
    try {
      const data = await login(credentials)
      token.value = data.accessToken
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return null
    loading.value = true
    try {
      user.value = await getMe(token.value)
      return user.value
    } catch {
      token.value = null
      localStorage.removeItem('accessToken')
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // Dipanggil sekali saat aplikasi dimuat: memulihkan sesi dari cookie
  // refresh httpOnly supaya pengguna tidak perlu login ulang tiap refresh.
  async function bootstrap() {
    if (bootstrapped) return user.value
    bootstrapped = true

    if (!token.value) {
      try {
        const data = await refreshSession()
        token.value = data.accessToken
        user.value = data.user ?? null
      } catch {
        return null
      }
    }

    if (token.value && !user.value) {
      await fetchMe()
    }
    return user.value
  }

  async function signOut() {
    await logout()
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    canManageContent,
    loading: computed(() => loading.value),
    signIn,
    fetchMe,
    bootstrap,
    signOut,
  }
}
