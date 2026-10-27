import test from 'node:test'
import assert from 'node:assert/strict'

import { validateAuth, validateElement } from '../src/middlewares/validate.js'

function run(middleware, body) {
  let statusCode
  let response
  let called = false
  middleware(
    { body },
    {
      status: (code) => {
        statusCode = code
        return {
          json: (data) => {
            response = data
          },
        }
      },
    },
    () => {
      called = true
    },
  )
  return { called, statusCode, response }
}

test('registration rejects an invalid email', () => {
  const result = run(validateAuth('register'), {
    name: 'Ayu',
    email: 'invalid',
    password: 'rahasia123',
  })
  assert.equal(result.called, false)
  assert.equal(result.statusCode, 400)
})

test('element validation accepts a complete valid payload', () => {
  const result = run(validateElement, {
    atomicNumber: 8,
    atomicMass: 15.999,
    symbol: 'O',
    nameId: 'Oksigen',
    nameLatin: 'Oxygen',
    electronConfig: '1s2 2s2 2p4',
    categoryId: '123e4567-e89b-42d3-a456-426614174000',
    period: 2,
    group: 16,
  })
  assert.equal(result.called, true)
})

test('element validation rejects an out-of-range group', () => {
  const result = run(validateElement, {
    atomicNumber: 8,
    atomicMass: 15.999,
    symbol: 'O',
    nameId: 'Oksigen',
    nameLatin: 'Oxygen',
    electronConfig: '1s2 2s2 2p4',
    categoryId: '123e4567-e89b-42d3-a456-426614174000',
    period: 2,
    group: 19,
  })
  assert.equal(result.called, false)
  assert.equal(result.statusCode, 400)
})
