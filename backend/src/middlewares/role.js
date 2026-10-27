import prisma from '../config/db.js'

// Peran yang lebih tinggi mencakup izin peran di bawahnya.
const ROLE_RANK = { user: 1, editor: 2, admin: 3 }

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses ditolak: diperlukan role ${allowedRoles.join(' atau ')}`,
      })
    }
    next()
  }
}

// Membutuhkan minimal peringkat tertentu, sehingga admin otomatis lolos
// aturan yang ditulis untuk editor.
export function requireMinRole(minimumRole) {
  const minimum = ROLE_RANK[minimumRole] ?? 99
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' })
    }
    const rank = ROLE_RANK[req.user.role] ?? 0
    if (rank < minimum) {
      return res.status(403).json({
        message: `Akses ditolak: diperlukan role minimal ${minimumRole}`,
      })
    }
    next()
  }
}

// Menolak token milik akun yang sudah dinonaktifkan atau dihapus, meskipun
// access token-nya belum kedaluwarsa.
export async function requireActiveUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true, isActive: true },
    })
    if (!user) {
      return res.status(401).json({ message: 'Akun tidak ditemukan' })
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Akun ini dinonaktifkan. Hubungi administrator.' })
    }
    // Role diambil dari database supaya perubahan role langsung berlaku.
    req.user.role = user.role
    next()
  } catch (error) {
    next(error)
  }
}
