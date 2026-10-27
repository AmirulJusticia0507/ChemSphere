import { Router } from 'express'

import prisma from '../config/db.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chemsphere-api' })
})

router.get('/db-test', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message })
  }
})

export default router
