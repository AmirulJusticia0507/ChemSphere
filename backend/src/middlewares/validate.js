const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function fail(res, message) {
  return res.status(400).json({ message })
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateAuth(mode) {
  return (req, res, next) => {
    const { name, email, password } = req.body ?? {}
    if (!nonEmpty(email) || !emailPattern.test(email.trim())) return fail(res, 'Email tidak valid')
    if (!nonEmpty(password) || password.length < 8) return fail(res, 'Password minimal 8 karakter')
    if (mode === 'register' && (!nonEmpty(name) || name.trim().length > 100)) {
      return fail(res, 'Nama wajib diisi dan maksimal 100 karakter')
    }
    next()
  }
}

export function validateElement(req, res, next) {
  const body = req.body ?? {}
  const requiredText = ['symbol', 'nameId', 'nameLatin', 'electronConfig', 'categoryId']
  if (requiredText.some((field) => !nonEmpty(body[field]))) return fail(res, 'Data unsur wajib diisi lengkap')
  if (!uuidPattern.test(body.categoryId)) return fail(res, 'Kategori tidak valid')

  const atomicNumber = Number(body.atomicNumber)
  const atomicMass = Number(body.atomicMass)
  const period = Number(body.period)
  const group = Number(body.group)
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    return fail(res, 'Nomor atom harus antara 1 dan 118')
  }
  if (!Number.isFinite(atomicMass) || atomicMass <= 0) return fail(res, 'Massa atom harus lebih dari 0')
  if (!Number.isInteger(period) || period < 1 || period > 7) return fail(res, 'Periode harus antara 1 dan 7')
  if (!Number.isInteger(group) || group < 1 || group > 18) return fail(res, 'Golongan harus antara 1 dan 18')

  // Properti opsional: bila dikirim, nilainya harus masuk akal.
  const numericChecks = [
    ['meltingPoint', -273.15, 10000, 'Titik leleh'],
    ['boilingPoint', -273.15, 10000, 'Titik didih'],
    ['density', 0, 100000, 'Massa jenis'],
    ['electronegativity', 0, 4, 'Elektronegativitas'],
    ['ionizationEnergy', 0, 20000, 'Energi ionisasi'],
    ['atomicRadius', 0, 1000, 'Jari-jari atom'],
    ['covalentRadius', 0, 1000, 'Jari-jari kovalen'],
    ['molarHeat', 0, 1000, 'Kalor molar'],
  ]
  for (const [field, min, max, label] of numericChecks) {
    const raw = body[field]
    if (raw === undefined || raw === null || raw === '') continue
    const value = Number(raw)
    if (!Number.isFinite(value) || value < min || value > max) {
      return fail(res, `${label} harus berupa angka antara ${min} dan ${max}`)
    }
  }

  if (body.yearDiscovered !== undefined && body.yearDiscovered !== null && body.yearDiscovered !== '') {
    const year = Number(body.yearDiscovered)
    if (!Number.isInteger(year) || year < -10000 || year > 2100) {
      return fail(res, 'Tahun penemuan harus berupa bilangan bulat yang wajar')
    }
  }

  next()
}

export function validateCategory(req, res, next) {
  if (!nonEmpty(req.body?.name) || req.body.name.trim().length > 100) {
    return fail(res, 'Nama kategori wajib diisi dan maksimal 100 karakter')
  }
  next()
}

export function validateIon(req, res, next) {
  const { name, formula, charge } = req.body ?? {}
  if (![name, formula, charge].every(nonEmpty)) return fail(res, 'Nama, rumus, dan muatan ion wajib diisi')
  if (name.trim().length > 100 || formula.trim().length > 50 || charge.trim().length > 20) {
    return fail(res, 'Data ion melebihi batas panjang yang diizinkan')
  }
  next()
}
