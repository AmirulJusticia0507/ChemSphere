import prisma from '../config/db.js'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { errorReportingEnabled } from '../utils/errorReporting.js'

const startedAt = Date.now()

// Metrik ringan untuk pemantauan: uptime, status database, dan jumlah data.
// Sengaja tanpa autentikasi namun hanya mengembalikan agregat, bukan data.
export const getMetrics = asyncHandler(async (_req, res) => {
  const memory = process.memoryUsage()

  let database = 'unknown'
  let counts = null

  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'connected'
    const [elements, categories, ions, users] = await Promise.all([
      prisma.element.count(),
      prisma.category.count(),
      prisma.polyatomicIon.count(),
      prisma.user.count(),
    ])
    counts = { elements, categories, ions, users }
  } catch {
    database = 'disconnected'
  }

  res.json({
    service: 'chemsphere-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
    database,
    counts,
    memory: {
      rssMb: Math.round(memory.rss / 1024 / 1024),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    },
    errorReporting: errorReportingEnabled ? 'enabled' : 'disabled',
  })
})
