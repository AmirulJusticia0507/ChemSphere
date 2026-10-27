import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

import prisma from './config/db.js'
import elementRoutes from './routes/elementRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import ionRoutes from './routes/ionRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chemsphere-backend' })
})

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

// Admin routes (auth + role required)
app.use('/api/v1/admin', adminRoutes)

server.listen(PORT, () => {
  console.log(`ChemSphere API berjalan di http://localhost:${PORT}`)
})

export default app
