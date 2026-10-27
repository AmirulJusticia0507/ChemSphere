import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import { AppError, asyncHandler } from '../middlewares/errorHandler.js'
import { revokeAllSessions } from './authController.js'

const ROLES = ['user', 'editor', 'admin']

const publicFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}

function parsePagination(query) {
  const page = Number(query.page)
  const limit = Number(query.limit)
  const usePagination =
    Number.isInteger(page) && Number.isInteger(limit) && page > 0 && limit > 0
  return usePagination ? { page, limit } : null
}

export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive } = req.query
  const where = {}

  if (search) {
    const term = String(search).trim()
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
    ]
  }

  if (role) {
    if (!ROLES.includes(role)) {
      throw new AppError(400, `Role harus salah satu dari: ${ROLES.join(', ')}`)
    }
    where.role = role
  }

  if (isActive === 'true' || isActive === 'false') {
    where.isActive = isActive === 'true'
  }

  const pagination = parsePagination(req.query)

  if (!pagination) {
    const users = await prisma.user.findMany({ where, select: publicFields, orderBy: { createdAt: 'desc' } })
    return res.json(users)
  }

  const total = await prisma.user.count({ where })
  const users = await prisma.user.findMany({
    where,
    select: publicFields,
    orderBy: { createdAt: 'desc' },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  })

  res.json({
    data: users,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  })
})

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: publicFields })
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan')
  res.json(user)
})

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body

  if (!name?.trim()) throw new AppError(400, 'Nama wajib diisi')
  if (!email?.trim()) throw new AppError(400, 'Email wajib diisi')
  if (!password || String(password).length < 8) throw new AppError(400, 'Password minimal 8 karakter')
  if (!ROLES.includes(role)) throw new AppError(400, `Role harus salah satu dari: ${ROLES.join(', ')}`)

  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) throw new AppError(409, 'Email sudah terdaftar')

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role,
    },
    select: publicFields,
  })

  res.status(201).json(user)
})

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive } = req.body
  const target = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!target) throw new AppError(404, 'Pengguna tidak ditemukan')

  const data = {}

  if (name !== undefined) {
    if (!String(name).trim()) throw new AppError(400, 'Nama tidak boleh kosong')
    data.name = String(name).trim()
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase()
    if (!normalizedEmail) throw new AppError(400, 'Email tidak boleh kosong')
    if (normalizedEmail !== target.email) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (existing) throw new AppError(409, 'Email sudah dipakai pengguna lain')
    }
    data.email = normalizedEmail
  }

  if (role !== undefined) {
    if (!ROLES.includes(role)) throw new AppError(400, `Role harus salah satu dari: ${ROLES.join(', ')}`)
    // Admin terakhir tidak boleh diturunkan menjadi non-admin, supaya tidak
    // ada kondisi di mana tidak seorang pun bisa mengelola aplikasi.
    if (target.role === 'admin' && role !== 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin', isActive: true } })
      if (adminCount <= 1) throw new AppError(409, 'Tidak dapat menurunkan admin terakhir')
    }
    data.role = role
  }

  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') throw new AppError(400, 'isActive harus bernilai boolean')
    if (!isActive && target.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin', isActive: true } })
      if (adminCount <= 1) throw new AppError(409, 'Tidak dapat menonaktifkan admin terakhir')
    }
    if (!isActive && target.id === req.user.id) {
      throw new AppError(409, 'Tidak dapat menonaktifkan akun sendiri')
    }
    data.isActive = isActive
  }

  const user = await prisma.user.update({ where: { id: target.id }, data, select: publicFields })

  // Perubahan role atau status harus memutus sesi yang sedang berjalan.
  if (data.role !== undefined || data.isActive === false) {
    await revokeAllSessions(target.id)
  }

  res.json(user)
})

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body
  if (!password || String(password).length < 8) throw new AppError(400, 'Password minimal 8 karakter')

  const target = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!target) throw new AppError(404, 'Pengguna tidak ditemukan')

  await prisma.user.update({
    where: { id: target.id },
    data: { password: await bcrypt.hash(password, 10) },
  })
  // Password baru membatalkan semua sesi lama.
  await revokeAllSessions(target.id)

  res.json({ message: 'Password pengguna berhasil diatur ulang' })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!target) throw new AppError(404, 'Pengguna tidak ditemukan')
  if (target.id === req.user.id) throw new AppError(409, 'Tidak dapat menghapus akun sendiri')
  if (target.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) throw new AppError(409, 'Tidak dapat menghapus admin terakhir')
  }

  await prisma.user.delete({ where: { id: target.id } })
  res.json({ message: 'Pengguna berhasil dihapus' })
})

// Profil pengguna yang sedang masuk: ubah nama dan password sendiri.
export const updateOwnProfile = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan')

  const data = {}

  if (name !== undefined) {
    if (!String(name).trim()) throw new AppError(400, 'Nama tidak boleh kosong')
    data.name = String(name).trim()
  }

  if (newPassword !== undefined) {
    if (!currentPassword) throw new AppError(400, 'Password saat ini wajib diisi')
    if (String(newPassword).length < 8) throw new AppError(400, 'Password baru minimal 8 karakter')
    const valid = await bcrypt.compare(String(currentPassword), user.password)
    if (!valid) throw new AppError(401, 'Password saat ini salah')
    data.password = await bcrypt.hash(String(newPassword), 10)
  }

  if (!Object.keys(data).length) throw new AppError(400, 'Tidak ada perubahan yang dikirim')

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: publicFields })
  res.json(updated)
})
