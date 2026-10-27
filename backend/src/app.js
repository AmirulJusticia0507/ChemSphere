import { createServer } from 'node:http'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import prisma from './config/db.js'
import env from './config/env.js'
import apiRouter from './routes/index.js'

const app = express()
const server = createServer(app)

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
)

app.get('/', (_req, res) => {
  res.json({ name: 'ChemSphere API', version: '1.0.0' })
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chemsphere-backend' })
})

app.use('/api/v1', apiRouter)

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint tidak ditemukan.' })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status ?? 500).json({
    status: 'error',
    message: env.nodeEnv === 'production' ? 'Terjadi kesalahan pada server.' : error.message,
  })
})

server.listen(env.port, () => {
  console.log(`ChemSphere API berjalan di http://localhost:${env.port}`)
})

async function shutdown(signal) {
  console.log(`${signal} diterima, menutup server...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

export default app
