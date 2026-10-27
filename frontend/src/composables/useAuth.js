import { ref, computed } from 'vue'
import { getMe, getToken, login, logout } from '../services/auth.js'

const token = ref(getToken())
const user = ref(null)
const loading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')

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
    token,
    user,
    isAuthenticated,
    isAdmin,
    loading: computed(() => loading.value),
    signIn,
    fetchMe,
    signOut,
  }
}
