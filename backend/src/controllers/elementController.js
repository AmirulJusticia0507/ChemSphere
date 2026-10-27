import prisma from '../config/db.js'

export async function getElements(req, res) {
  try {
    const { category, search } = req.query
    const where = {}
    if (category) where.category = { name: category }
    if (search) {
      where.OR = [
        { nameId: { contains: search, mode: 'insensitive' } },
        { nameLatin: { contains: search, mode: 'insensitive' } },
        { symbol: { contains: search, mode: 'insensitive' } },
      ]
    }
    const elements = await prisma.element.findMany({
      where,
      include: { category: true },
      orderBy: { atomicNumber: 'asc' },
    })
    res.json(elements)
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
