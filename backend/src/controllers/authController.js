import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import {
  REFRESH_COOKIE_NAME,
  hashToken,
  publicUser,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js'

async function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashToken(refreshToken) },
  })

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
  return accessToken
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' })
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name: String(name).trim(), email: normalizedEmail, password: hashed, role: 'user' },
    })
    res.status(201).json({
      message: 'Registrasi berhasil',
      user: publicUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' })
    }
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } })
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Akun ini dinonaktifkan. Hubungi administrator.' })
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const accessToken = await issueSession(res, user)
    res.json({
      message: 'Login berhasil',
      accessToken,
      user: publicUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Menukar refresh token (cookie httpOnly) dengan access token baru.
// Token lama langsung diganti (rotasi) sehingga token yang dicuri hanya
// bisa dipakai sekali sebelum sesi asli memutusnya.
export async function refresh(req, res) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME]
    if (!token) {
      return res.status(401).json({ message: 'Sesi tidak ditemukan, silakan masuk kembali' })
    }

    let payload
    try {
      payload = verifyRefreshToken(token)
    } catch {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
      return res.status(401).json({ message: 'Sesi kedaluwarsa, silakan masuk kembali' })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user || !user.refreshToken || user.refreshToken !== hashToken(token)) {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
      return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
    }
    if (user.isActive === false) {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
      return res.status(403).json({ message: 'Akun ini dinonaktifkan. Hubungi administrator.' })
    }

    const accessToken = await issueSession(res, user)
    res.json({ accessToken, user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME]
    if (token) {
      try {
        const payload = verifyRefreshToken(token)
        await prisma.user.updateMany({
          where: { id: payload.id, refreshToken: hashToken(token) },
          data: { refreshToken: null },
        })
      } catch {
        // Token sudah tidak valid; cookie tetap dibersihkan di bawah.
      }
    }
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
    res.json({ message: 'Logout berhasil' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mencabut semua sesi pengguna (mis. setelah ganti password atau dari panel admin).
export async function revokeAllSessions(userId) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } })
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
