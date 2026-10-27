import prisma from '../config/db.js'
import { AppError, asyncHandler } from '../middlewares/errorHandler.js'

export const QUIZ_TOPICS = ['simbol', 'nomor-atom', 'kategori', 'golongan-periode', 'campuran']

// Membuat satu soal dari data unsur. Soal dibangkitkan di server supaya
// jawaban benar tidak pernah dikirim ke client sebelum dijawab.
function buildQuestion(topic, element, pool) {
  const distractors = (exclude, count) => {
    const options = []
    const used = new Set([exclude])
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    for (const candidate of shuffled) {
      if (options.length >= count) break
      if (used.has(candidate)) continue
      used.add(candidate)
      options.push(candidate)
    }
    return options
  }

  if (topic === 'simbol') {
    const answer = element.symbol
    return {
      question: `Apa simbol kimia untuk ${element.nameId}?`,
      answer,
      options: [answer, ...distractors(answer, 3)],
    }
  }

  if (topic === 'nomor-atom') {
    const answer = String(element.atomicNumber)
    const numbers = distractors(answer, 3)
    return {
      question: `Berapa nomor atom ${element.nameId} (${element.symbol})?`,
      answer,
      options: [answer, ...numbers],
    }
  }

  if (topic === 'kategori') {
    const answer = element.category?.name ?? 'Tidak diketahui'
    return {
      question: `Unsur ${element.nameId} (${element.symbol}) termasuk kategori apa?`,
      answer,
      options: [answer, ...distractors(answer, 3)],
    }
  }

  if (topic === 'golongan-periode') {
    const answer = `Golongan ${element.group}, periode ${element.period}`
    return {
      question: `Di golongan dan periode mana ${element.nameId} (${element.symbol}) berada?`,
      answer,
      options: [answer, ...distractors(answer, 3)],
    }
  }

  // campuran: pilih jenis soal secara acak
  const kinds = ['simbol', 'nomor-atom', 'kategori', 'golongan-periode']
  return buildQuestion(kinds[Math.floor(Math.random() * kinds.length)], element, pool)
}

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Membuat satu set soal. Jawaban benar disimpan di server (session token
// sederhana di memori proses) agar tidak bisa dibaca dari payload.
const answerKey = new Map()

export const startQuiz = asyncHandler(async (req, res) => {
  const topic = String(req.body?.topic ?? 'campuran')
  const count = Math.min(Math.max(Number(req.body?.count ?? 10), 1), 30)

  if (!QUIZ_TOPICS.includes(topic)) {
    throw new AppError(400, `Topik harus salah satu dari: ${QUIZ_TOPICS.join(', ')}`)
  }

  const elements = await prisma.element.findMany({
    include: { category: { select: { name: true } } },
  })
  if (elements.length < 8) {
    throw new AppError(503, 'Data unsur belum cukup untuk membuat kuis')
  }

  const pool = elements.map((element) => element.symbol)
  const categoryPool = [...new Set(elements.map((element) => element.category?.name).filter(Boolean))]
  const positionPool = elements.map((element) => `Golongan ${element.group}, periode ${element.period}`)

  const picked = shuffle(elements).slice(0, count)
  const questions = picked.map((element, index) => {
    const poolForTopic =
      topic === 'kategori' ? categoryPool : topic === 'golongan-periode' ? positionPool : pool
    const built = buildQuestion(topic, element, poolForTopic)
    return {
      id: `${index}`,
      question: built.question,
      options: shuffle(built.options),
      answer: built.answer,
    }
  })

  const quizId = `${req.user.id}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`
  answerKey.set(quizId, {
    userId: req.user.id,
    topic,
    createdAt: Date.now(),
    answers: questions.map((question) => question.answer),
  })

  // Bersihkan sesi kuis lama agar memori tidak tumbuh tanpa batas.
  const cutoff = Date.now() - 60 * 60 * 1000
  for (const [key, value] of answerKey.entries()) {
    if (value.createdAt < cutoff) answerKey.delete(key)
  }

  res.json({
    quizId,
    topic,
    questions: questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
    })),
  })
})

export const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers, durationSec } = req.body
  const session = answerKey.get(quizId)

  if (!session) {
    throw new AppError(404, 'Sesi kuis tidak ditemukan atau sudah kedaluwarsa')
  }
  if (session.userId !== req.user.id) {
    throw new AppError(403, 'Sesi kuis ini bukan milik Anda')
  }
  if (!Array.isArray(answers) || answers.length !== session.answers.length) {
    throw new AppError(400, 'Jumlah jawaban tidak sesuai dengan jumlah soal')
  }

  const results = session.answers.map((correct, index) => ({
    index,
    correct,
    given: answers[index] ?? null,
    isCorrect: answers[index] === correct,
  }))

  const correctCount = results.filter((result) => result.isCorrect).length
  const total = session.answers.length
  const score = Math.round((correctCount / total) * 100)

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: req.user.id,
      topic: session.topic,
      total,
      correct: correctCount,
      score,
      durationSec: Number.isInteger(Number(durationSec)) ? Number(durationSec) : null,
    },
  })

  answerKey.delete(quizId)

  res.json({
    attemptId: attempt.id,
    topic: session.topic,
    total,
    correct: correctCount,
    score,
    results,
  })
})

export const listAttempts = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100)
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  res.json(attempts)
})
