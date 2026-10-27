export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak: role admin diperlukan' })
    }
    next()
  }
}
