import prisma from '../config/db.js'

export async function getIons(req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function createIon(req, res) {
  try {
    const { name, formula, charge, description } = req.body
    const ion = await prisma.polyatomicIon.create({ data: { name, formula, charge, description } })
    res.status(201).json(ion)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function updateIon(req, res) {
  try {
    const { name, formula, charge, description } = req.body
    const ion = await prisma.polyatomicIon.update({
      where: { id: req.params.id },
      data: { name, formula, charge, description },
    })
    res.json(ion)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function deleteIon(req, res) {
  try {
    await prisma.polyatomicIon.delete({ where: { id: req.params.id } })
    res.json({ message: 'Ion berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
