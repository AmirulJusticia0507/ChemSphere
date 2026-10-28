import prisma from '../config/db.js'
import { asyncHandler } from '../middlewares/errorHandler.js'

export const getIons = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query
  const where = {}
  if (search) {
    const term = String(search).trim()
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { formula: { contains: term, mode: 'insensitive' } },
    ]
  }

  const usePagination =
    Number.isInteger(Number(page)) &&
    Number.isInteger(Number(limit)) &&
    Number(page) > 0 &&
    Number(limit) > 0

  if (!usePagination) {
    const ions = await prisma.polyatomicIon.findMany({
      where,
      orderBy: { name: 'asc' },
    })
    return res.json(ions)
  }

  const currentPage = Number(page)
  const perPage = Number(limit)
  const total = await prisma.polyatomicIon.count({ where })
  const ions = await prisma.polyatomicIon.findMany({
    where,
    orderBy: { name: 'asc' },
    skip: (currentPage - 1) * perPage,
    take: perPage,
  })

  res.json({
    data: ions,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  })
})

export const getIonById = asyncHandler(async (req, res) => {
  const ion = await prisma.polyatomicIon.findUnique({ where: { id: req.params.id } })
  if (!ion) return res.status(404).json({ message: 'Ion tidak ditemukan' })
  res.json(ion)
})

export const createIon = asyncHandler(async (req, res) => {
  const { name, formula, charge, description } = req.body
  const ion = await prisma.polyatomicIon.create({ data: { name, formula, charge, description } })
  res.status(201).json(ion)
})

export const updateIon = asyncHandler(async (req, res) => {
  const { name, formula, charge, description } = req.body
  const ion = await prisma.polyatomicIon.update({
    where: { id: req.params.id },
    data: { name, formula, charge, description },
  })
  res.json(ion)
})

export const deleteIon = asyncHandler(async (req, res) => {
  await prisma.polyatomicIon.delete({ where: { id: req.params.id } })
  res.json({ message: 'Ion berhasil dihapus' })
})
