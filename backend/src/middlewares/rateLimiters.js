import rateLimit from 'express-rate-limit'

function jsonLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  })
}

// Limiter umum untuk seluruh API.
export const apiLimiter = jsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.',
})

// Login dan register dibatasi jauh lebih ketat untuk memperlambat
// percobaan menebak password.
export const authLimiter = jsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.',
})

export const refreshLimiter = jsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Terlalu banyak permintaan penyegaran sesi. Coba lagi nanti.',
})
