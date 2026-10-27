import test from 'node:test'
import assert from 'node:assert/strict'

import { requireMinRole, requireRole } from '../src/middlewares/role.js'

function run(middleware, user) {
  let statusCode
  let body
  let called = false
  middleware(
    { user },
    {
      status: (code) => {
        statusCode = code
        return {
          json: (payload) => {
            body = payload
          },
        }
      },
    },
    () => {
      called = true
    },
  )
  return { called, statusCode, body }
}

test('requireRole lets an allowed role through', () => {
  const result = run(requireRole('admin'), { id: '1', role: 'admin' })
  assert.equal(result.called, true)
})

test('requireRole rejects a role that is not listed', () => {
  const result = run(requireRole('admin'), { id: '1', role: 'editor' })
  assert.equal(result.called, false)
  assert.equal(result.statusCode, 403)
})

test('requireRole rejects an unauthenticated request', () => {
  const result = run(requireRole('admin'), undefined)
  assert.equal(result.called, false)
  assert.equal(result.statusCode, 401)
})

test('requireMinRole lets admin pass an editor rule', () => {
  const result = run(requireMinRole('editor'), { id: '1', role: 'admin' })
  assert.equal(result.called, true)
})

test('requireMinRole blocks user from an editor rule', () => {
  const result = run(requireMinRole('editor'), { id: '1', role: 'user' })
  assert.equal(result.called, false)
  assert.equal(result.statusCode, 403)
})

test('requireMinRole blocks editor from an admin rule', () => {
  const result = run(requireMinRole('admin'), { id: '1', role: 'editor' })
  assert.equal(result.called, false)
  assert.equal(result.statusCode, 403)
})
