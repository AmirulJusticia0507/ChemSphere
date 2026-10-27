import prisma from '../config/db.js'
import { AppError, asyncHandler } from '../middlewares/errorHandler.js'

export const listBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user.id },
    include: {
      element: {
        select: {
          id: true,
          atomicNumber: true,
          symbol: true,
          nameId: true,
          atomicMass: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(bookmarks)
})

export const addBookmark = asyncHandler(async (req, res) => {
  const { elementId, note } = req.body
  if (!elementId) throw new AppError(400, 'elementId wajib diisi')

  const element = await prisma.element.findUnique({ where: { id: elementId }, select: { id: true } })
  if (!element) throw new AppError(404, 'Unsur tidak ditemukan')

  const existing = await prisma.bookmark.findUnique({
    where: { userId_elementId: { userId: req.user.id, elementId } },
  })
  if (existing) throw new AppError(409, 'Unsur ini sudah ada di daftar simpanan')

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: req.user.id,
      elementId,
      note: note ? String(note).slice(0, 255) : null,
    },
    include: {
      element: { select: { id: true, symbol: true, nameId: true, atomicNumber: true } },
    },
  })
  res.status(201).json(bookmark)
})

export const removeBookmark = asyncHandler(async (req, res) => {
  const { elementId } = req.params
  const deleted = await prisma.bookmark.deleteMany({
    where: { userId: req.user.id, elementId },
  })
  if (!deleted.count) throw new AppError(404, 'Simpanan tidak ditemukan')
  res.json({ message: 'Unsur dihapus dari simpanan' })
})

// Ringkasan progres belajar: jumlah simpanan dan statistik kuis.
export const getProgress = asyncHandler(async (req, res) => {
  const [bookmarkCount, attempts, aggregate] = await Promise.all([
    prisma.bookmark.count({ where: { userId: req.user.id } }),
    prisma.quizAttempt.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.quizAttempt.aggregate({
      where: { userId: req.user.id },
      _avg: { score: true },
      _max: { score: true },
      _count: { id: true },
    }),
  ])

  // Topik dengan skor rata-rata terendah, untuk menyarankan latihan berikutnya.
  const byTopic = await prisma.quizAttempt.groupBy({
    by: ['topic'],
    where: { userId: req.user.id },
    _avg: { score: true },
    _count: { id: true },
  })

  const weakest = [...byTopic]
    .sort((a, b) => (a._avg.score ?? 0) - (b._avg.score ?? 0))
    .slice(0, 3)
    .map((row) => ({
      topic: row.topic,
      averageScore: Math.round(row._avg.score ?? 0),
      attempts: row._count.id,
    }))

  res.json({
    bookmarkCount,
    attempts: aggregate._count.id,
    averageScore: aggregate._avg.score ? Math.round(aggregate._avg.score) : null,
    bestScore: aggregate._max.score ?? null,
    recentAttempts: attempts,
    weakestTopics: weakest,
  })
})
