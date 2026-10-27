const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers },
    ...options,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message ?? `Permintaan gagal (${response.status})`)
  }
  return body
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem('accessToken', data.accessToken)
  return data
}

export async function register({ name, email, password, role }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  })
}

export async function getMe(token) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function logout() {
  localStorage.removeItem('accessToken')
}

export function getToken() {
  return localStorage.getItem('accessToken')
}

export function isAuthenticated() {
  return !!getToken()
}
