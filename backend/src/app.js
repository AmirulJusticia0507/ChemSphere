import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import prisma from './config/db.js'
import elementRoutes from './routes/elementRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import ionRoutes from './routes/ionRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import learnRoutes from './routes/learnRoutes.js'
import { apiLimiter } from './middlewares/rateLimiters.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { logger, requestContext } from './utils/logger.js'
import { reportError } from './utils/errorReporting.js'
import { getMetrics } from './controllers/metricsController.js'
import { getApiDocsPage, getOpenApiSpec } from './controllers/docsController.js'
import { getRobots, getSitemap } from './controllers/seoController.js'

const app = express()

// Daftar origin yang diizinkan. Di produksi CORS_ORIGIN wajib diisi; nilai
// kosong tidak lagi berarti "terima semua origin".
function allowedOrigins() {
  return (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const origins = allowedOrigins()
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && origins.length === 0) {
  logger.warn('CORS_ORIGIN belum diisi di produksi; permintaan lintas origin akan ditolak')
}

if (!isProduction && origins.length === 0) {
  origins.push('http://localhost:5173', 'http://127.0.0.1:5173')
}

app.set('trust proxy', 1)

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      // Permintaan tanpa Origin (curl, health check, same-origin) selalu lolos.
      if (!origin) return callback(null, true)
      if (origins.includes(origin)) return callback(null, true)
      return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`))
    },
    credentials: true,
  }),
)
app.use(requestContext)
app.use(apiLimiter)
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chemsphere-backend' })
})

// Metrik operasional (uptime, status DB, jumlah data)
app.get('/metrics', getMetrics)

// Dokumentasi API
app.get('/openapi.json', getOpenApiSpec)
app.get('/docs', getApiDocsPage)

// SEO
app.get('/sitemap.xml', getSitemap)
app.get('/robots.txt', getRobots)

// Root
app.get('/', (_req, res) => {
  res.json({ name: 'ChemSphere API', version: '1.0.0' })
})

// Test koneksi database
app.get('/api/v1/db-test', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message })
  }
})

// Public API routes
app.use('/api/v1/elements', elementRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/ions', ionRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/profile', profileRoutes)
app.use('/api/v1/learn', learnRoutes)

// Admin routes (auth + role required)
app.use('/api/v1/admin', adminRoutes)

// 404 untuk semua path yang tidak dikenali, lalu penanganan error terpusat.
app.use(notFoundHandler)
app.use(errorHandler)

// Only listen when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const server = createServer(app)
  const PORT = process.env.PORT || 5000
  server.listen(PORT, () => {
    logger.info('ChemSphere API berjalan', {
      port: Number(PORT),
      env: process.env.NODE_ENV ?? 'development',
    })
  })

  // Jangan biarkan proses mati diam-diam: catat lalu keluar dengan kode error
  // agar supervisor (Docker, PM2, systemd) dapat me-restart.
  process.on('unhandledRejection', (reason) => {
    logger.error('unhandled promise rejection', { message: String(reason) })
    reportError(reason instanceof Error ? reason : new Error(String(reason)), {
      source: 'unhandledRejection',
    })
  })

  process.on('uncaughtException', (error) => {
    logger.error('uncaught exception', { message: error.message, stack: error.stack })
    reportError(error, { source: 'uncaughtException' })
    // Beri kesempatan log terkirim sebelum keluar.
    setTimeout(() => process.exit(1), 500)
  })

  const shutdown = (signal) => {
    logger.info('mematikan server', { signal })
    server.close(() => {
      prisma.$disconnect().finally(() => process.exit(0))
    })
    // Paksa keluar bila koneksi menggantung.
    setTimeout(() => process.exit(1), 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

export default app
