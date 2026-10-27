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

export async function getElements() {
  return asList(await request('/elements'))
}

export async function getElement(id) {
  return request(`/elements/${encodeURIComponent(id)}`)
}

export async function createElement(payload) {
  return request('/elements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateElement(id, payload) {
  return request(`/elements/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteElement(id) {
  return request(`/elements/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getCategories() {
  return asList(await request('/categories'))
}

export async function createCategory(payload) {
  return request('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateCategory(id, payload) {
  return request(`/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteCategory(id) {
  return request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getIons() {
  return asList(await request('/ions'))
}

export async function createIon(payload) {
  return request('/ions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateIon(id, payload) {
  return request(`/ions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteIon(id) {
  return request(`/ions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
