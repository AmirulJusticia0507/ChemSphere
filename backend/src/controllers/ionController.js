import prisma from '../config/db.js'

export async function getIons(req, res) {
  try {
    const ions = await prisma.polyatomicIon.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(ions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function createIon(req, res) {
  try {
    const { name, formula, charge } = req.body
    const ion = await prisma.polyatomicIon.create({ data: { name, formula, charge } })
    res.status(201).json(ion)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function updateIon(req, res) {
  try {
    const { name, formula, charge } = req.body
    const ion = await prisma.polyatomicIon.update({
      where: { id: req.params.id },
      data: { name, formula, charge },
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
