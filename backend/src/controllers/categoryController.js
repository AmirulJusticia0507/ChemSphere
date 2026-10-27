import prisma from '../config/db.js'

export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { elements: true } } },
      orderBy: { name: 'asc' },
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function createCategory(req, res) {
  try {
    const { name } = req.body
    const category = await prisma.category.create({ data: { name } })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function updateCategory(req, res) {
  try {
    const { name } = req.body
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name },
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
