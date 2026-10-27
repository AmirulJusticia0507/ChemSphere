import prisma from '../config/db.js'

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getCategories(req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function createCategory(req, res) {
  try {
    const { name } = req.body
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' })
    }
    const category = await prisma.category.create({
      data: { name: name.trim(), slug: slugify(name) },
    })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function updateCategory(req, res) {
  try {
    const { name } = req.body
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' })
    }
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: name.trim(), slug: slugify(name) },
    })
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function deleteCategory(req, res) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ message: 'Kategori berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
