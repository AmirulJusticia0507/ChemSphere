import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export const REFRESH_COOKIE_NAME = 'refreshToken'
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function refreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
}

export function signAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  })
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user.id }, refreshSecret(), { expiresIn: REFRESH_EXPIRES_IN })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret())
}

// Refresh token disimpan dalam bentuk hash: bocornya isi tabel users tidak
// langsung memberi penyerang sesi yang bisa dipakai.
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex')
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  }
}

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}
