import { logger } from '../utils/logger.js'

// Error yang sengaja dilempar aplikasi dengan status dan pesan yang aman
// ditampilkan ke client.
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
    this.expose = true
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    requestId: req.id,
  })
}

// Semua error berakhir di sini. Detail internal hanya masuk log, bukan respons.
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode ?? err.status ?? 500

  if (statusCode >= 500) {
    logger.error('unhandled error', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      name: err.name,
      message: err.message,
      stack: err.stack?.split('\n').slice(0, 8),
    })
  } else {
    logger.warn('request rejected', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: statusCode,
      message: err.message,
    })
  }

  if (res.headersSent) return

  const isProduction = process.env.NODE_ENV === 'production'
  const message =
    err.expose || !isProduction
      ? err.message
      : 'Terjadi kesalahan pada server. Silakan coba lagi.'

  res.status(statusCode).json({
    message,
    ...(err.details ? { details: err.details } : {}),
    requestId: req.id,
  })
}

// Pembungkus handler async supaya penolakan promise tidak menjadi unhandled
// rejection yang mematikan proses.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
