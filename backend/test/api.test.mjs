import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'

// Test lapisan HTTP tanpa menyentuh database: health check, root, 404 handler,
// header request id, dan validasi input yang ditolak sebelum query Prisma.
//
// DATABASE_URL diisi nilai dummy supaya modul config tidak melempar error;
// tidak ada koneksi yang benar-benar dibuka pada test ini.

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@127.0.0.1:5432/test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
process.env.NODE_ENV = 'test'
process.env.CORS_ORIGIN = 'http://localhost:5173'
// Menahan app.js agar tidak membuka port sendiri; test memakai server sendiri.
process.env.VERCEL = '1'

let server
let baseUrl

before(async () => {
  const { default: app } = await import('../src/app.js')
  server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  baseUrl = `http://127.0.0.1:${port}`
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
})

async function get(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options)
}

test('GET /health returns ok', async () => {
  const response = await get('/health')
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.status, 'ok')
})

test('GET / returns the service identity', async () => {
  const response = await get('/')
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.name, 'ChemSphere API')
})

test('every response carries a request id header', async () => {
  const response = await get('/health')
  assert.ok(response.headers.get('x-request-id'))
})

test('a supplied request id is echoed back', async () => {
  const response = await get('/health', { headers: { 'x-request-id': 'trace-123' } })
  assert.equal(response.headers.get('x-request-id'), 'trace-123')
})

test('unknown paths return a 404 with a helpful message', async () => {
  const response = await get('/api/v1/tidak-ada')
  assert.equal(response.status, 404)
  const body = await response.json()
  assert.match(body.message, /tidak ditemukan/i)
  assert.ok(body.requestId)
})

test('registration rejects an invalid email before touching the database', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ayu', email: 'bukan-email', password: 'rahasia123' }),
  })
  assert.equal(response.status, 400)
  const body = await response.json()
  assert.match(body.message, /email/i)
})

test('registration rejects a short password', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ayu', email: 'ayu@example.com', password: 'pendek' }),
  })
  assert.equal(response.status, 400)
  const body = await response.json()
  assert.match(body.message, /password/i)
})

test('login rejects an empty body', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  assert.equal(response.status, 400)
})

test('protected admin routes reject requests without a token', async () => {
  const response = await get('/api/v1/admin/users')
  assert.equal(response.status, 401)
})

test('protected admin routes reject an invalid token', async () => {
  const response = await get('/api/v1/admin/users', {
    headers: { Authorization: 'Bearer token-palsu' },
  })
  assert.equal(response.status, 403)
})

test('refresh without a cookie is rejected', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, { method: 'POST' })
  assert.equal(response.status, 401)
})

test('CORS rejects an origin that is not on the allowlist', async () => {
  const response = await get('/health', { headers: { Origin: 'http://evil.example.com' } })
  assert.notEqual(response.status, 200)
})

test('CORS allows the configured origin', async () => {
  const response = await get('/health', { headers: { Origin: 'http://localhost:5173' } })
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173')
})
