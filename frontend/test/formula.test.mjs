import test from 'node:test'
import assert from 'node:assert/strict'

import { generateCompounds, molarMass, parseFormula, prettyFormula } from '../src/utils/formula.js'

const names = {
  H: 'Hidrogen',
  O: 'Oksigen',
  Na: 'Natrium',
  Cl: 'Klorin',
  Fe: 'Besi',
  S: 'Sulfur',
  N: 'Nitrogen',
  C: 'Karbon',
  Al: 'Aluminium',
  Ca: 'Kalsium',
  He: 'Helium',
  Cu: 'Tembaga',
  P: 'Fosfor',
  Mg: 'Magnesium',
}
const nameOf = (symbol) => names[symbol] ?? null

function formulas(result) {
  return result.compounds.map((compound) => compound.formula)
}

test('parseFormula handles parentheses and multipliers', () => {
  assert.deepEqual(parseFormula('Al2(SO4)3'), { Al: 2, S: 3, O: 12 })
  assert.deepEqual(parseFormula('Ca(OH)2'), { Ca: 1, O: 2, H: 2 })
  assert.deepEqual(parseFormula('C6H12O6'), { C: 6, H: 12, O: 6 })
})

test('prettyFormula converts digits to subscripts', () => {
  assert.equal(prettyFormula('Fe2O3'), 'Fe₂O₃')
  assert.equal(prettyFormula('H2O'), 'H₂O')
})

test('cross valency produces Al2O3 for aluminium and oxygen', () => {
  const result = generateCompounds('Al', 'O', nameOf)
  assert.ok(formulas(result).includes('Al2O3'))
})

test('iron and oxygen yields both oxidation states', () => {
  const result = generateCompounds('Fe', 'O', nameOf)
  const list = formulas(result)
  assert.ok(list.includes('Fe2O3'), 'expected Fe2O3')
  assert.ok(list.includes('FeO'), 'expected FeO')
})

test('sodium and chlorine yields NaCl', () => {
  const result = generateCompounds('Na', 'Cl', nameOf)
  assert.ok(formulas(result).includes('NaCl'))
})

test('covalent naming uses Indonesian element names, not symbols', () => {
  const result = generateCompounds('C', 'O', nameOf)
  const co2 = result.compounds.find((compound) => compound.formula === 'CO2')
  assert.ok(co2, 'expected CO2')
  assert.equal(co2.name, 'Karbon dioksida')
})

test('hydrogen and nitrogen does not invent NH5', () => {
  const result = generateCompounds('N', 'H', nameOf)
  const list = formulas(result)
  assert.ok(list.includes('NH3'))
  assert.ok(!list.includes('NH5'), 'NH5 must not be generated')
})

test('no duplicate formulas are returned', () => {
  for (const [a, b] of [
    ['H', 'O'],
    ['S', 'O'],
    ['Fe', 'O'],
    ['Al', 'O'],
  ]) {
    const list = formulas(generateCompounds(a, b, nameOf))
    assert.equal(new Set(list).size, list.length, `duplicates for ${a}+${b}: ${list.join(', ')}`)
  }
})

test('noble gases are reported as unreactive', () => {
  const result = generateCompounds('He', 'O', nameOf)
  assert.equal(result.compounds.length, 0)
  assert.match(result.reason, /gas mulia/i)
})

test('two metals are reported as an alloy, not a compound', () => {
  const result = generateCompounds('Cu', 'Fe', nameOf)
  assert.equal(result.compounds.length, 0)
  assert.match(result.reason, /paduan|alloy/i)
})

test('molar mass sums atomic masses from the formula', () => {
  const masses = { H: 1.008, O: 15.999 }
  const { total, missing } = molarMass('H2O', (symbol) => masses[symbol])
  assert.equal(missing.length, 0)
  assert.ok(Math.abs(total - 18.015) < 0.001)
})

test('molar mass reports unknown symbols', () => {
  const { missing } = molarMass('Xx2O', () => undefined)
  assert.ok(missing.includes('Xx'))
})
