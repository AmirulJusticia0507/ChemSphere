import prisma from '../config/db.js'

export async function getElements(req, res) {
  try {
    const { category, search, group, period, page, limit } = req.query
    const where = {}

    if (category) where.category = { name: category }

    if (group !== undefined && group !== '') {
      const parsedGroup = Number(group)
      if (Number.isInteger(parsedGroup)) where.group = parsedGroup
    }

    if (period !== undefined && period !== '') {
      const parsedPeriod = Number(period)
      if (Number.isInteger(parsedPeriod)) where.period = parsedPeriod
    }

    if (search) {
      const term = String(search).trim()
      where.OR = [
        { nameId: { contains: term, mode: 'insensitive' } },
        { nameLatin: { contains: term, mode: 'insensitive' } },
        { symbol: { contains: term, mode: 'insensitive' } },
      ]

      const atomicNumber = Number(term)
      if (Number.isInteger(atomicNumber) && atomicNumber > 0) {
        where.OR.push({ atomicNumber })
      }
    }

    const usePagination =
      Number.isInteger(Number(page)) &&
      Number.isInteger(Number(limit)) &&
      Number(page) > 0 &&
      Number(limit) > 0

    if (!usePagination) {
      const elements = await prisma.element.findMany({
        where,
        include: { category: true },
        orderBy: { atomicNumber: 'asc' },
      })
      return res.json(elements)
    }

    const currentPage = Number(page)
    const perPage = Number(limit)
    const total = await prisma.element.count({ where })
    const elements = await prisma.element.findMany({
      where,
      include: { category: true },
      orderBy: { atomicNumber: 'asc' },
      skip: (currentPage - 1) * perPage,
      take: perPage,
    })

    res.json({
      data: elements,
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

export async function getElementById(req, res) {
  try {
    const element = await prisma.element.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    })
    if (!element) {
      return res.status(404).json({ message: 'Unsur tidak ditemukan' })
    }
    res.json(element)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function createElement(req, res) {
  try {
    const {
      atomicNumber, symbol, nameId, nameLatin, atomicMass,
      electronConfig, period, group, categoryId, description, uses, hazardWarning,
    } = req.body
    const element = await prisma.element.create({
      data: {
        atomicNumber,
        symbol,
        nameId,
        nameLatin,
        atomicMass: parseFloat(atomicMass),
        electronConfig,
        period: parseInt(period),
        group: parseInt(group),
        categoryId,
        description,
        uses,
        hazardWarning,
      },
      include: { category: true },
    })
    res.status(201).json(element)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function updateElement(req, res) {
  try {
    const {
      atomicNumber, symbol, nameId, nameLatin, atomicMass,
      electronConfig, period, group, categoryId, description, uses, hazardWarning,
    } = req.body
    const element = await prisma.element.update({
      where: { id: req.params.id },
      data: {
        atomicNumber,
        symbol,
        nameId,
        nameLatin,
        atomicMass: parseFloat(atomicMass),
        electronConfig,
        period: parseInt(period),
        group: parseInt(group),
        categoryId,
        description,
        uses,
        hazardWarning,
      },
      include: { category: true },
    })
    res.json(element)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function deleteElement(req, res) {
  try {
    await prisma.element.delete({ where: { id: req.params.id } })
    res.json({ message: 'Unsur berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
