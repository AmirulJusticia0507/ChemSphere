const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  })

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
  return request('/admin/elements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateElement(id, payload) {
  return request(`/admin/elements/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
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
  return request('/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateCategory(id, payload) {
  return request(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
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
  return request('/admin/ions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateIon(id, payload) {
  return request(`/admin/ions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteIon(id) {
  return request(`/admin/ions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
