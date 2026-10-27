import prisma from '../config/db.js'
import { AppError, asyncHandler } from '../middlewares/errorHandler.js'

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query
  const where = {}
  if (search) {
    where.name = { contains: String(search).trim(), mode: 'insensitive' }
  }

  const usePagination =
    Number.isInteger(Number(page)) &&
    Number.isInteger(Number(limit)) &&
    Number(page) > 0 &&
    Number(limit) > 0

  if (!usePagination) {
    const categories = await prisma.category.findMany({
      where,
      include: { _count: { select: { elements: true } } },
      orderBy: { name: 'asc' },
    })
    return res.json(categories)
  }

  const currentPage = Number(page)
  const perPage = Number(limit)
  const total = await prisma.category.count({ where })
  const categories = await prisma.category.findMany({
    where,
    include: { _count: { select: { elements: true } } },
    orderBy: { name: 'asc' },
    skip: (currentPage - 1) * perPage,
    take: perPage,
  })

  res.json({
    data: categories,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  })
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) {
    throw new AppError(400, 'Nama kategori wajib diisi')
  }
  const category = await prisma.category.create({
    data: { name: name.trim(), slug: slugify(name) },
  })
  res.status(201).json(category)
})

export const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) {
    throw new AppError(400, 'Nama kategori wajib diisi')
  }
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name: name.trim(), slug: slugify(name) },
  })
  res.json(category)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ message: 'Kategori berhasil dihapus' })
})
