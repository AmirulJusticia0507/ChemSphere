import { ref, computed } from 'vue'
import { login, logout, getToken, getMe, isAuthenticated } from '../services/auth.js'

const token = ref(getToken())
const user = ref(null)
const loading = ref(false)

export function useAuth() {
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

  function signOut() {
    logout()
    token.value = null
    user.value = null
  }

  return {
    token: computed(() => token.value),
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated()),
    isAdmin: computed(() => user.value?.role === 'admin'),
    loading: computed(() => loading.value),
    signIn,
    fetchMe,
    signOut,
  }
}
