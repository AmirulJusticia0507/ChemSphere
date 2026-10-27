import {
  ANION_NAMES,
  COVALENT_PREFIX,
  CURATED_COMPOUNDS,
  ELECTRONEGATIVITY_ORDER,
  ELEMENT_VALENCY,
  POLYATOMIC_IONS,
} from '../data/valency.js'

const SUBSCRIPT = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function gcd(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

// Menulis angka sebagai subskrip Unicode; angka 1 tidak ditulis.
export function subscript(count) {
  if (!count || count === 1) return ''
  return String(count)
    .split('')
    .map((digit) => SUBSCRIPT[Number(digit)])
    .join('')
}

export function romanNumeral(value) {
  return ROMAN[value] ?? String(value)
}

// Rumus ASCII (mis. "H2O") menjadi rumus bersubskrip ("H₂O").
export function prettyFormula(formula) {
  return String(formula).replace(/(\d+)/g, (match) => subscript(Number(match)))
}

// Mengurai rumus ASCII menjadi peta jumlah atom. Mendukung tanda kurung
// sederhana seperti "Ca(OH)2" dan "Al2(SO4)3".
export function parseFormula(formula) {
  const counts = {}
  const stack = [counts]
  let index = 0
  const text = String(formula)

  while (index < text.length) {
    const char = text[index]

    if (char === '(') {
      const next = {}
      stack.push(next)
      index += 1
      continue
    }

    if (char === ')') {
      const group = stack.pop()
      index += 1
      let digits = ''
      while (index < text.length && /\d/.test(text[index])) {
        digits += text[index]
        index += 1
      }
      const multiplier = digits ? Number(digits) : 1
      const target = stack[stack.length - 1]
      for (const [symbol, count] of Object.entries(group)) {
        target[symbol] = (target[symbol] ?? 0) + count * multiplier
      }
      continue
    }

    const match = /^[A-Z][a-z]?/.exec(text.slice(index))
    if (!match) {
      index += 1
      continue
    }
    const symbol = match[0]
    index += symbol.length
    let digits = ''
    while (index < text.length && /\d/.test(text[index])) {
      digits += text[index]
      index += 1
    }
    const target = stack[stack.length - 1]
    target[symbol] = (target[symbol] ?? 0) + (digits ? Number(digits) : 1)
  }

  return counts
}

function info(symbol) {
  return ELEMENT_VALENCY[symbol] ?? null
}

function isMetal(symbol) {
  return info(symbol)?.kind === 'logam'
}

function isNobleGas(symbol) {
  return info(symbol)?.kind === 'gas-mulia'
}

// Urutan penulisan pada senyawa biner kovalen: unsur kurang elektronegatif dulu.
function covalentOrder(a, b) {
  const indexA = ELECTRONEGATIVITY_ORDER.indexOf(a)
  const indexB = ELECTRONEGATIVITY_ORDER.indexOf(b)
  if (indexA === -1 && indexB === -1) return [a, b]
  if (indexA === -1) return [b, a]
  if (indexB === -1) return [a, b]
  return indexA <= indexB ? [a, b] : [b, a]
}

function covalentName(first, second, countFirst, countSecond, nameOf) {
  const prefixFirst = countFirst > 1 ? COVALENT_PREFIX[countFirst] : ''
  const prefixSecond = countSecond > 1 ? COVALENT_PREFIX[countSecond] : ''
  const firstName = (nameOf(first) ?? first).toLowerCase()
  const baseSecond = ANION_NAMES[second] ?? (nameOf(second) ?? second).toLowerCase()
  return `${prefixFirst}${firstName} ${prefixSecond}${baseSecond}`.trim()
}

function ionicName(cation, cationCharge, anion, nameOf) {
  const cationName = nameOf(cation) ?? cation
  const states = info(cation)?.states ?? []
  const needsStock = states.length > 1
  const labeled = needsStock ? `${cationName}(${romanNumeral(cationCharge)})` : cationName
  const anionName = ANION_NAMES[anion] ?? anion.toLowerCase()
  return `${labeled} ${anionName}`
}

// Silang valensi: kation bermuatan c dan anion bermuatan a menghasilkan
// M(a) A(c), lalu disederhanakan dengan FPB.
function crossValency(cation, cationCharge, anion, anionCharge) {
  const divisor = gcd(cationCharge, anionCharge)
  return {
    cationCount: anionCharge / divisor,
    anionCount: cationCharge / divisor,
  }
}

function compoundEntry({ formula, name, description, type, note }) {
  return {
    formula,
    display: prettyFormula(formula),
    name,
    description,
    type,
    note,
  }
}

// Senyawa kurasi yang tersusun tepat dari dua unsur terpilih.
function curatedFor(a, b) {
  const results = []
  for (const [formula, data] of Object.entries(CURATED_COMPOUNDS)) {
    const counts = parseFormula(formula)
    const symbols = Object.keys(counts)
    if (symbols.length !== 2) continue
    if (!symbols.includes(a) || !symbols.includes(b)) continue
    results.push(
      compoundEntry({
        formula,
        name: data.name,
        description: data.description,
        type: isMetal(a) || isMetal(b) ? 'ionik' : 'kovalen',
      }),
    )
  }
  return results
}

// Senyawa ionik dari logam + nonlogam, termasuk alternatif ion poliatomik.
function ionicCandidates(metal, nonmetal, nameOf) {
  const metalInfo = info(metal)
  const nonmetalInfo = info(nonmetal)
  const results = []

  const anionCharge = nonmetalInfo?.anionValency ?? 0
  if (anionCharge > 0) {
    for (const charge of metalInfo?.states ?? []) {
      const { cationCount, anionCount } = crossValency(metal, charge, nonmetal, anionCharge)
      const formula = `${metal}${cationCount > 1 ? cationCount : ''}${nonmetal}${anionCount > 1 ? anionCount : ''}`
      results.push(
        compoundEntry({
          formula,
          name: ionicName(metal, charge, nonmetal, nameOf),
          description: `Senyawa ionik dari kation ${nameOf(metal) ?? metal} bermuatan +${charge} dan anion ${ANION_NAMES[nonmetal] ?? nonmetal} bermuatan -${anionCharge}. Muatan totalnya netral.`,
          type: 'ionik',
        }),
      )
    }
  }

  // Alternatif dengan ion poliatomik yang memuat unsur nonlogam tersebut.
  const charge = metalInfo?.states?.[0] ?? 0
  if (charge > 0) {
    for (const ion of POLYATOMIC_IONS) {
      if (ion.polarity !== 'anion') continue
      if (!ion.contains.includes(nonmetal)) continue
      const { cationCount, anionCount } = crossValency(metal, charge, ion.formula, ion.charge)
      // Tanda kurung hanya perlu saat ion poliatomik muncul lebih dari sekali.
      const ionPart = anionCount > 1 ? `(${ion.formula})${anionCount}` : ion.formula
      const formula = `${metal}${cationCount > 1 ? cationCount : ''}${ionPart}`
      results.push(
        compoundEntry({
          formula,
          name: `${nameOf(metal) ?? metal}${metalInfo.states.length > 1 ? `(${romanNumeral(charge)})` : ''} ${ion.name}`,
          description: `Senyawa ionik dengan anion poliatomik ${ion.display} bermuatan ${ion.charge < 0 ? '' : '-'}${Math.abs(ion.charge)}. Ion poliatomik tetap utuh saat membentuk senyawa.`,
          type: 'ionik',
          note: 'poliatomik',
        }),
      )
    }
  }

  return results
}

// Senyawa kovalen dari dua nonlogam: silang valensi tiap kombinasi bilangan oksidasi.
function covalentCandidates(a, b, nameOf) {
  const [first, second] = covalentOrder(a, b)
  const firstInfo = info(first)
  const secondInfo = info(second)
  const results = []

  let firstStates = firstInfo?.states?.length ? firstInfo.states : [firstInfo?.valency ?? 0]
  let secondStates = secondInfo?.states?.length ? secondInfo.states : [secondInfo?.valency ?? 0]

  // Hidrida: hidrogen selalu bervalensi 1, dan unsur pasangannya hanya memakai
  // bilangan oksidasi terendah. Tanpa aturan ini muncul senyawa tak nyata
  // seperti NH₅.
  if (first === 'H') secondStates = [Math.min(...secondStates)]
  if (second === 'H') firstStates = [Math.min(...firstStates)]

  for (const firstValency of firstStates) {
    for (const secondValency of secondStates) {
      if (!firstValency || !secondValency) continue
      const { cationCount, anionCount } = crossValency(first, firstValency, second, secondValency)
      // Rumus disimpan sebagai ASCII supaya bisa diurai ulang dan didedupe.
      const formula = `${first}${cationCount > 1 ? cationCount : ''}${second}${anionCount > 1 ? anionCount : ''}`
      results.push(
        compoundEntry({
          formula,
          name: covalentName(first, second, cationCount, anionCount, nameOf),
          description: `Senyawa kovalen biner. ${nameOf(first) ?? first} menyumbang ${firstValency} ikatan dan ${nameOf(second) ?? second} menyumbang ${secondValency} ikatan, sehingga perbandingan atomnya ${cationCount}:${anionCount}.`,
          type: 'kovalen',
        }),
      )
    }
  }

  return results
}

// Ion poliatomik yang dapat dibentuk dari pasangan nonlogam (mis. N + H -> NH4+).
function ionCandidates(a, b) {
  const results = []
  for (const ion of POLYATOMIC_IONS) {
    if (ion.contains.length !== 2) continue
    if (!ion.contains.includes(a) || !ion.contains.includes(b)) continue
    results.push({
      formula: ion.formula,
      display: ion.display,
      name: `Ion ${ion.name}`,
      description: `Ion poliatomik ${ion.display} dengan muatan ${ion.charge > 0 ? '+' : '-'}${Math.abs(ion.charge)}. Ion ini dapat berpasangan dengan ion berlawanan muatan.`,
      type: 'ion',
      charge: ion.charge,
    })
  }
  return results
}

function dedupe(entries) {
  const seen = new Set()
  const output = []
  for (const entry of entries) {
    const key = `${entry.type}:${entry.formula}`
    if (seen.has(key)) continue
    seen.add(key)
    output.push(entry)
  }
  return output
}

/**
 * Menghasilkan daftar kemungkinan senyawa dari dua simbol unsur.
 *
 * @param {string} symbolA simbol unsur pertama
 * @param {string} symbolB simbol unsur kedua
 * @param {(symbol: string) => string} [nameOf] pemetaan simbol ke nama Indonesia
 * @returns {{ compounds: object[], ions: object[], reason: string|null }}
 */
export function generateCompounds(symbolA, symbolB, nameOf = () => null) {
  if (!symbolA || !symbolB) {
    return { compounds: [], ions: [], reason: 'Pilih dua unsur terlebih dahulu.' }
  }

  if (symbolA === symbolB) {
    if (isNobleGas(symbolA)) {
      return {
        compounds: [],
        ions: [],
        reason: `${symbolA} adalah gas mulia dengan kulit terluar penuh, sehingga praktis tidak membentuk senyawa.`,
      }
    }
    const homonuclear = {
      H: {
        formula: 'H2',
        name: 'Gas hidrogen',
        description: 'Dua atom hidrogen berikatan kovalen tunggal.',
      },
      O: {
        formula: 'O2',
        name: 'Gas oksigen',
        description: 'Ikatan rangkap dua antara dua atom oksigen.',
      },
      N: {
        formula: 'N2',
        name: 'Gas nitrogen',
        description: 'Ikatan rangkap tiga yang sangat kuat, membuat N₂ sangat stabil.',
      },
      F: {
        formula: 'F2',
        name: 'Gas fluorin',
        description: 'Gas kuning pucat yang sangat reaktif.',
      },
      Cl: {
        formula: 'Cl2',
        name: 'Gas klorin',
        description: 'Gas kuning kehijauan yang dipakai sebagai disinfektan air.',
      },
      Br: {
        formula: 'Br2',
        name: 'Bromin',
        description: 'Cairan merah kecokelatan pada suhu kamar.',
      },
      I: {
        formula: 'I2',
        name: 'Iodin',
        description: 'Padatan ungu kehitaman yang menyublim menjadi uap ungu.',
      },
      S: {
        formula: 'S8',
        name: 'Belerang',
        description: 'Belerang unsur tersusun sebagai cincin S₈.',
      },
      P: {
        formula: 'P4',
        name: 'Fosfor putih',
        description: 'Fosfor putih tersusun sebagai tetrahedron P₄.',
      },
    }
    const known = homonuclear[symbolA]
    if (known) {
      return {
        compounds: [compoundEntry({ ...known, type: 'kovalen' })],
        ions: [],
        reason: null,
      }
    }
    return {
      compounds: [],
      ions: [],
      reason: `Unsur ${symbolA} tidak membentuk molekul diatomik sederhana. Senyawa butuh dua unsur berbeda.`,
    }
  }

  if (isNobleGas(symbolA) || isNobleGas(symbolB)) {
    const noble = isNobleGas(symbolA) ? symbolA : symbolB
    return {
      compounds: [],
      ions: [],
      reason: `${noble} adalah gas mulia dengan kulit terluar penuh. Ia praktis tidak membentuk senyawa, kecuali senyawa langka seperti XeF₄ di kondisi khusus.`,
    }
  }

  const metalA = isMetal(symbolA)
  const metalB = isMetal(symbolB)
  let generated = []

  if (metalA && !metalB) {
    generated = ionicCandidates(symbolA, symbolB, nameOf)
  } else if (metalB && !metalA) {
    generated = ionicCandidates(symbolB, symbolA, nameOf)
  } else if (!metalA && !metalB) {
    generated = covalentCandidates(symbolA, symbolB, nameOf)
  } else {
    // Dua logam tidak membentuk senyawa biner sederhana; keduanya cenderung
    // membentuk paduan (alloy), bukan senyawa dengan perbandingan tetap.
    return {
      compounds: [],
      ions: [],
      reason: `${symbolA} dan ${symbolB} keduanya logam. Dua logam umumnya membentuk paduan (alloy) seperti kuningan atau perunggu, bukan senyawa dengan rumus tetap.`,
    }
  }

  const curated = curatedFor(symbolA, symbolB)
  const ions = ionCandidates(symbolA, symbolB)

  // Senyawa kurasi ditaruh lebih dulu karena namanya lebih dikenal.
  const compounds = dedupe([...curated, ...generated])

  return {
    compounds,
    ions,
    reason: compounds.length
      ? null
      : 'Tidak ada senyawa biner sederhana yang dapat disusun dari pasangan ini.',
  }
}

// Massa molar dari rumus, memakai massa atom yang diberikan.
export function molarMass(formula, massOf) {
  const counts = parseFormula(formula)
  let total = 0
  const missing = []
  for (const [symbol, count] of Object.entries(counts)) {
    const mass = massOf(symbol)
    if (!mass) {
      missing.push(symbol)
      continue
    }
    total += mass * count
  }
  return { total, missing }
}
