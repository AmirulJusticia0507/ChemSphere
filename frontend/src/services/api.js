const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return null
        const body = await response.json().catch(() => null)
        if (body?.accessToken) localStorage.setItem('accessToken', body.accessToken)
        return body?.accessToken ?? null
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function send(path, options) {
  return fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  })
}

async function request(path, options = {}) {
  let response = await send(path, options)

  if (response.status === 401 && !options.skipRefresh) {
    const token = await refreshAccessToken()
    if (token) {
      response = await send(path, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      })
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Permintaan gagal (${response.status})`)
  }

  if (response.status === 204) return null
  return response.json()
}

function asList(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.data ?? []
}

function jsonBody(method, payload) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

export async function getElements(options = {}) {
  const query = new URLSearchParams()
  if (options.page) query.set('page', options.page)
  if (options.limit) query.set('limit', options.limit)
  if (options.search) query.set('search', options.search)
  const qs = query.toString()
  return asList(await request(`/elements${qs ? `?${qs}` : ''}`))
}

// Mengembalikan struktur paginasi utuh { data, pagination } untuk panel admin.
export async function getElementsPage(options = {}) {
  const query = new URLSearchParams()
  query.set('page', options.page ?? 1)
  query.set('limit', options.limit ?? 10)
  if (options.search) query.set('search', options.search)
  const payload = await request(`/elements?${query.toString()}`)
  if (Array.isArray(payload)) return { data: payload, pagination: null }
  return payload
}

export async function getElement(id) {
  return request(`/elements/${encodeURIComponent(id)}`)
}

export async function createElement(payload) {
  return request('/admin/elements', jsonBody('POST', payload))
}

export async function updateElement(id, payload) {
  return request(`/admin/elements/${encodeURIComponent(id)}`, jsonBody('PUT', payload))
}

export async function deleteElement(id) {
  return request(`/admin/elements/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getCategories(options = {}) {
  const query = new URLSearchParams()
  if (options.page) query.set('page', options.page)
  if (options.limit) query.set('limit', options.limit)
  if (options.search) query.set('search', options.search)
  const qs = query.toString()
  return asList(await request(`/categories${qs ? `?${qs}` : ''}`))
}

export async function getCategoriesPage(options = {}) {
  const query = new URLSearchParams()
  query.set('page', options.page ?? 1)
  query.set('limit', options.limit ?? 10)
  if (options.search) query.set('search', options.search)
  const payload = await request(`/categories?${query.toString()}`)
  if (Array.isArray(payload)) return { data: payload, pagination: null }
  return payload
}

export async function createCategory(payload) {
  return request('/admin/categories', jsonBody('POST', payload))
}

export async function updateCategory(id, payload) {
  return request(`/admin/categories/${encodeURIComponent(id)}`, jsonBody('PUT', payload))
}

export async function deleteCategory(id) {
  return request(`/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getIons(options = {}) {
  const query = new URLSearchParams()
  if (options.page) query.set('page', options.page)
  if (options.limit) query.set('limit', options.limit)
  if (options.search) query.set('search', options.search)
  const qs = query.toString()
  return asList(await request(`/ions${qs ? `?${qs}` : ''}`))
}

export async function getIonsPage(options = {}) {
  const query = new URLSearchParams()
  query.set('page', options.page ?? 1)
  query.set('limit', options.limit ?? 10)
  if (options.search) query.set('search', options.search)
  const payload = await request(`/ions?${query.toString()}`)
  if (Array.isArray(payload)) return { data: payload, pagination: null }
  return payload
}

export async function createIon(payload) {
  return request('/admin/ions', jsonBody('POST', payload))
}

export async function updateIon(id, payload) {
  return request(`/admin/ions/${encodeURIComponent(id)}`, jsonBody('PUT', payload))
}

export async function deleteIon(id) {
  return request(`/admin/ions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// --- Manajemen pengguna (admin) ---

export async function getUsersPage(options = {}) {
  const query = new URLSearchParams()
  query.set('page', options.page ?? 1)
  query.set('limit', options.limit ?? 10)
  if (options.search) query.set('search', options.search)
  if (options.role) query.set('role', options.role)
  if (options.isActive !== undefined && options.isActive !== '') query.set('isActive', options.isActive)
  const payload = await request(`/admin/users?${query.toString()}`)
  if (Array.isArray(payload)) return { data: payload, pagination: null }
  return payload
}

export async function createUser(payload) {
  return request('/admin/users', jsonBody('POST', payload))
}

export async function updateUser(id, payload) {
  return request(`/admin/users/${encodeURIComponent(id)}`, jsonBody('PUT', payload))
}

export async function resetUserPassword(id, password) {
  return request(`/admin/users/${encodeURIComponent(id)}/password`, jsonBody('PUT', { password }))
}

export async function deleteUser(id) {
  return request(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// --- Profil sendiri ---

export async function updateOwnProfile(payload) {
  return request('/profile/me', jsonBody('PUT', payload))
}

// --- Belajar: simpanan, progres, kuis ---

export async function getBookmarks() {
  return asList(await request('/learn/bookmarks'))
}

export async function addBookmark(elementId, note) {
  return request('/learn/bookmarks', jsonBody('POST', { elementId, note }))
}

export async function removeBookmark(elementId) {
  return request(`/learn/bookmarks/${encodeURIComponent(elementId)}`, { method: 'DELETE' })
}

export async function getProgress() {
  return request('/learn/progress')
}

export async function startQuiz(topic, count = 10) {
  return request('/learn/quiz/start', jsonBody('POST', { topic, count }))
}

export async function submitQuiz(quizId, answers, durationSec) {
  return request('/learn/quiz/submit', jsonBody('POST', { quizId, answers, durationSec }))
}

export async function getQuizAttempts(limit = 20) {
  return asList(await request(`/learn/quiz/attempts?limit=${limit}`))
}
