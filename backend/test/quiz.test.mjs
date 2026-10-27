import test from 'node:test'
import assert from 'node:assert/strict'

// Menguji logika pembangkitan soal secara terpisah dari Express/Prisma.
const QUIZ_TOPICS = ['simbol', 'nomor-atom', 'kategori', 'golongan-periode', 'campuran']

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
    return {
      question: `Berapa nomor atom ${element.nameId} (${element.symbol})?`,
      answer,
      options: [answer, ...distractors(answer, 3)],
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
  const answer = `Golongan ${element.group}, periode ${element.period}`
  return {
    question: `Di golongan dan periode mana ${element.nameId} (${element.symbol}) berada?`,
    answer,
    options: [answer, ...distractors(answer, 3)],
  }
}

const fe = {
  symbol: 'Fe',
  nameId: 'Besi',
  atomicNumber: 26,
  group: 8,
  period: 4,
  category: { name: 'Logam Transisi' },
}
const pool = [
  'H',
  'He',
  'Li',
  'Be',
  'B',
  'C',
  'N',
  'O',
  'F',
  'Ne',
  'Na',
  'Mg',
  'Al',
  'Si',
  'P',
  'S',
  'Cl',
  'Ar',
  'K',
  'Ca',
]

test('simbol question includes the correct answer', () => {
  const q = buildQuestion('simbol', fe, pool)
  assert.ok(q.options.includes('Fe'))
  assert.equal(q.answer, 'Fe')
})

test('nomor-atom question uses the atomic number as a string', () => {
  const q = buildQuestion('nomor-atom', fe, pool)
  assert.equal(q.answer, '26')
  assert.ok(q.options.includes('26'))
})

test('kategori question uses the category name', () => {
  const q = buildQuestion('kategori', fe, ['Logam Transisi', 'Nonlogam', 'Halogen', 'Gas Mulia'])
  assert.equal(q.answer, 'Logam Transisi')
})

test('golongan-periode question formats position', () => {
  const q = buildQuestion('golongan-periode', fe, [
    'Golongan 1, periode 1',
    'Golongan 2, periode 2',
  ])
  assert.equal(q.answer, 'Golongan 8, periode 4')
})

test('distractors never duplicate the answer', () => {
  for (let i = 0; i < 20; i += 1) {
    const q = buildQuestion('simbol', fe, pool)
    const unique = new Set(q.options)
    assert.equal(unique.size, q.options.length, 'options must be unique')
  }
})

test('quiz topics list is stable', () => {
  assert.equal(QUIZ_TOPICS.length, 5)
  assert.ok(QUIZ_TOPICS.includes('campuran'))
})
