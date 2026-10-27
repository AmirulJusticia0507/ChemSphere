<script setup>
import { computed, onMounted, ref } from 'vue'

import { getElements } from '../services/api.js'
import { prettyFormula } from '../utils/formula.js'
import {
  AVOGADRO,
  MOLAR_VOLUME_STP,
  balanceEquation,
  dilution,
  massFromMoles,
  molarMassOf,
  molarity,
  molesFromMass,
  molesFromParticles,
  particlesFromMoles,
  volumeFromMoles,
} from '../utils/stoichiometry.js'

const elements = ref([])
const loadingElements = ref(true)

const massBySymbol = computed(() => {
  const map = {}
  for (const element of elements.value) map[element.symbol] = Number(element.atomicMass)
  return map
})

const massOf = (symbol) => massBySymbol.value[symbol] ?? null

const tabs = [
  { id: 'massa', label: 'Massa molar' },
  { id: 'setara', label: 'Penyetara reaksi' },
  { id: 'mol', label: 'Mol & partikel' },
  { id: 'larutan', label: 'Larutan' },
]
const activeTab = ref('massa')

onMounted(async () => {
  try {
    elements.value = await getElements()
  } catch {
    elements.value = []
  } finally {
    loadingElements.value = false
  }
})

function formatNumber(value, digits = 4) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return value.toLocaleString('id-ID', { maximumFractionDigits: digits })
}

// --- Massa molar ---
const molarInput = ref('H2O')
const molarResult = computed(() => {
  const formula = molarInput.value.trim()
  if (!formula) return null
  const { total, missing, breakdown } = molarMassOf(formula, massOf)
  if (missing.length) {
    return { error: `Unsur tidak dikenali: ${missing.join(', ')}` }
  }
  if (!breakdown.length) return { error: 'Rumus tidak dapat dibaca.' }
  return { total, breakdown }
})

// --- Penyetara reaksi ---
const equationInput = ref('Fe2O3 + CO -> Fe + CO2')
const balanceResult = computed(() => balanceEquation(equationInput.value))

const balanceExamples = [
  'H2 + O2 -> H2O',
  'CH4 + O2 -> CO2 + H2O',
  'Fe + O2 -> Fe2O3',
  'NaOH + H2SO4 -> Na2SO4 + H2O',
  'KClO3 -> KCl + O2',
]

// --- Mol, massa, partikel ---
const molMode = ref('massa-ke-mol')
const molFormula = ref('H2O')
const molValue = ref('')

const molMolarMass = computed(() => {
  const { total, missing } = molarMassOf(molFormula.value.trim(), massOf)
  if (missing.length || !total) return null
  return total
})

const molResult = computed(() => {
  const value = Number(molValue.value)
  if (!Number.isFinite(value) || value < 0) return null
  const M = molMolarMass.value
  if (!M) return null

  if (molMode.value === 'massa-ke-mol') {
    const moles = molesFromMass(value, M)
    return {
      primary: `${formatNumber(moles, 6)} mol`,
      rows: [
        ['Mol (n)', `${formatNumber(moles, 6)} mol`],
        ['Jumlah partikel', `${formatNumber(particlesFromMoles(moles), 4)} partikel`],
        ['Volume gas pada STP', `${formatNumber(volumeFromMoles(moles), 4)} L`],
      ],
    }
  }

  if (molMode.value === 'mol-ke-massa') {
    const mass = massFromMoles(value, M)
    return {
      primary: `${formatNumber(mass, 4)} g`,
      rows: [
        ['Massa (m)', `${formatNumber(mass, 4)} g`],
        ['Jumlah partikel', `${formatNumber(particlesFromMoles(value), 4)} partikel`],
        ['Volume gas pada STP', `${formatNumber(volumeFromMoles(value), 4)} L`],
      ],
    }
  }

  // partikel ke mol
  const moles = molesFromParticles(value)
  return {
    primary: `${formatNumber(moles, 8)} mol`,
    rows: [
      ['Mol (n)', `${formatNumber(moles, 8)} mol`],
      ['Massa (m)', `${formatNumber(massFromMoles(moles, M), 6)} g`],
      ['Volume gas pada STP', `${formatNumber(volumeFromMoles(moles), 6)} L`],
    ],
  }
})

// --- Larutan ---
const solutionMode = ref('molaritas')
const solutionForm = ref({
  moles: '',
  volume: '',
  mass: '',
  molarMass: '',
  m1: '',
  v1: '',
  m2: '',
  v2: '',
})

const solutionResult = computed(() => {
  const form = solutionForm.value

  if (solutionMode.value === 'molaritas') {
    const moles = Number(form.moles)
    const volume = Number(form.volume)
    if (!Number.isFinite(moles) || !Number.isFinite(volume) || volume <= 0) return null
    const M = molarity(moles, volume)
    return {
      primary: `${formatNumber(M, 4)} M`,
      rows: [['Konsentrasi', `${formatNumber(M, 4)} mol/L`]],
    }
  }

  if (solutionMode.value === 'massa-molaritas') {
    const mass = Number(form.mass)
    const volume = Number(form.volume)
    const Mm = Number(form.molarMass)
    if (![mass, volume, Mm].every((v) => Number.isFinite(v)) || volume <= 0 || Mm <= 0) return null
    const moles = molesFromMass(mass, Mm)
    const M = molarity(moles, volume)
    return {
      primary: `${formatNumber(M, 4)} M`,
      rows: [
        ['Mol zat terlarut', `${formatNumber(moles, 6)} mol`],
        ['Konsentrasi', `${formatNumber(M, 4)} mol/L`],
      ],
    }
  }

  // pengenceran M1V1 = M2V2
  const parse = (value) => (value === '' || value === null ? null : Number(value))
  const result = dilution({
    m1: parse(form.m1),
    v1: parse(form.v1),
    m2: parse(form.m2),
    v2: parse(form.v2),
  })
  if (result.error) return { error: result.error }
  return {
    primary: `${formatNumber(result.value, 4)}`,
    rows: [
      ['Nilai yang dihitung', result.solvedFor],
      ['Hasil', formatNumber(result.value, 4)],
    ],
  }
})

const constants = [
  ['Bilangan Avogadro', `6,022 × 10²³ partikel/mol`],
  ['Volume molar gas (STP)', `${MOLAR_VOLUME_STP} L/mol`],
]
</script>

<template>
  <div class="shell pt-10 pb-16">
    <nav class="mb-8 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/">Beranda</RouterLink>
      <span class="mx-2">/</span><span class="text-ink">Kalkulator</span>
    </nav>

    <header
      class="relative isolate overflow-hidden rounded-card bg-navy px-6 py-10 text-white sm:px-10"
    >
      <span
        class="absolute -top-20 -right-12 -z-10 h-60 w-60 rounded-full border border-white/10"
      ></span>
      <p class="m-0 text-[.7rem] font-bold tracking-[.15em] text-[#f0d56e] uppercase">
        Alat hitung
      </p>
      <h1
        class="mt-2 mb-0 max-w-2xl font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] font-bold tracking-[-.055em]"
      >
        Kalkulator kimia
      </h1>
      <p class="mt-4 mb-0 max-w-2xl text-sm leading-relaxed text-white/70">
        Massa molar, penyetaraan reaksi, konversi mol, dan perhitungan larutan. Massa atom diambil
        dari data unsur di aplikasi ini.
      </p>
    </header>

    <div class="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition"
        :class="activeTab === tab.id ? 'bg-navy text-white' : 'bg-white text-ink hover:bg-paper'"
        :aria-pressed="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="loadingElements" class="mt-6 text-sm text-muted" aria-busy="true">
      Memuat massa atom…
    </p>

    <!-- Massa molar -->
    <section v-if="activeTab === 'massa'" class="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div class="rounded-card border border-line bg-white p-6">
        <h2 class="m-0 font-display text-xl font-bold tracking-[-.04em] text-ink">
          Hitung massa molar
        </h2>
        <p class="mt-1 mb-0 text-sm text-muted">
          Tulis rumus kimia, misalnya H2O, Ca(OH)2, atau Al2(SO4)3.
        </p>

        <label class="mt-5 block">
          <span class="mb-2 block text-xs font-bold text-muted">Rumus</span>
          <input
            v-model="molarInput"
            type="text"
            placeholder="H2O"
            class="w-full rounded-xl border border-line px-4 py-3 font-mono text-lg text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          />
        </label>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="example in ['H2O', 'NaCl', 'C6H12O6', 'Ca(OH)2', 'Al2(SO4)3', 'Fe2O3']"
            :key="example"
            type="button"
            class="cursor-pointer rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:border-navy/30"
            @click="molarInput = example"
          >
            {{ example }}
          </button>
        </div>
      </div>

      <div
        class="rounded-card border border-navy/10 bg-[linear-gradient(135deg,#eef6ff_0%,#fff8f4_100%)] p-6"
        aria-live="polite"
      >
        <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">Hasil</p>

        <template v-if="molarResult && !molarResult.error">
          <p
            class="mt-4 mb-0 font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-none font-bold tracking-[-.05em] text-navy"
          >
            {{ formatNumber(molarResult.total, 4) }}
          </p>
          <p class="mt-1 mb-0 text-sm font-semibold text-muted">g/mol</p>

          <table class="mt-5 w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-navy/10 text-left">
                <th class="py-2 text-[.65rem] font-bold tracking-[.1em] text-muted uppercase">
                  Unsur
                </th>
                <th class="py-2 text-[.65rem] font-bold tracking-[.1em] text-muted uppercase">
                  Jumlah
                </th>
                <th
                  class="py-2 text-right text-[.65rem] font-bold tracking-[.1em] text-muted uppercase"
                >
                  Kontribusi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in molarResult.breakdown"
                :key="row.symbol"
                class="border-b border-navy/5 last:border-0"
              >
                <td class="py-2 font-semibold text-ink">{{ row.symbol }}</td>
                <td class="py-2 text-muted">{{ row.count }} × {{ formatNumber(row.mass, 3) }}</td>
                <td class="py-2 text-right font-semibold text-ink">
                  {{ formatNumber(row.subtotal, 3) }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>

        <p
          v-else-if="molarResult?.error"
          class="mt-4 mb-0 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]"
        >
          {{ molarResult.error }}
        </p>
        <p v-else class="mt-4 mb-0 text-sm text-muted">Masukkan rumus untuk melihat hasil.</p>
      </div>
    </section>

    <!-- Penyetara reaksi -->
    <section v-if="activeTab === 'setara'" class="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div class="rounded-card border border-line bg-white p-6">
        <h2 class="m-0 font-display text-xl font-bold tracking-[-.04em] text-ink">
          Setarakan persamaan
        </h2>
        <p class="mt-1 mb-0 text-sm text-muted">
          Gunakan tanda <code class="rounded bg-paper px-1">-&gt;</code> atau
          <code class="rounded bg-paper px-1">=</code> antara reaktan dan produk.
        </p>

        <label class="mt-5 block">
          <span class="mb-2 block text-xs font-bold text-muted">Persamaan reaksi</span>
          <textarea
            v-model="equationInput"
            rows="3"
            placeholder="Fe2O3 + CO -> Fe + CO2"
            class="w-full resize-y rounded-xl border border-line px-4 py-3 font-mono text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          ></textarea>
        </label>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="example in balanceExamples"
            :key="example"
            type="button"
            class="cursor-pointer rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:border-navy/30"
            @click="equationInput = example"
          >
            {{ example }}
          </button>
        </div>
      </div>

      <div
        class="rounded-card border border-navy/10 bg-[linear-gradient(135deg,#eef6ff_0%,#fff8f4_100%)] p-6"
        aria-live="polite"
      >
        <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">Hasil</p>

        <template v-if="balanceResult.ok">
          <p
            class="mt-4 mb-0 font-display text-xl leading-snug font-bold tracking-[-.03em] text-navy break-words"
          >
            {{ balanceResult.balanced }}
          </p>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p class="m-0 text-[.65rem] font-bold tracking-[.1em] text-muted uppercase">
                Reaktan
              </p>
              <ul class="mt-2 mb-0 list-none space-y-1 p-0 text-sm">
                <li
                  v-for="item in balanceResult.left"
                  :key="`l-${item.formula}`"
                  class="text-[#39455e]"
                >
                  <span class="font-bold text-navy">{{ item.coefficient }}</span> ×
                  {{ prettyFormula(item.formula) }}
                </li>
              </ul>
            </div>
            <div>
              <p class="m-0 text-[.65rem] font-bold tracking-[.1em] text-muted uppercase">Produk</p>
              <ul class="mt-2 mb-0 list-none space-y-1 p-0 text-sm">
                <li
                  v-for="item in balanceResult.right"
                  :key="`r-${item.formula}`"
                  class="text-[#39455e]"
                >
                  <span class="font-bold text-navy">{{ item.coefficient }}</span> ×
                  {{ prettyFormula(item.formula) }}
                </li>
              </ul>
            </div>
          </div>
        </template>

        <p v-else class="mt-4 mb-0 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
          {{ balanceResult.error }}
        </p>
      </div>
    </section>

    <!-- Mol -->
    <section v-if="activeTab === 'mol'" class="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div class="rounded-card border border-line bg-white p-6">
        <h2 class="m-0 font-display text-xl font-bold tracking-[-.04em] text-ink">Konversi mol</h2>

        <label class="mt-4 block">
          <span class="mb-2 block text-xs font-bold text-muted">Jenis konversi</span>
          <select
            v-model="molMode"
            class="w-full cursor-pointer rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink"
          >
            <option value="massa-ke-mol">Massa (g) → mol</option>
            <option value="mol-ke-massa">Mol → massa (g)</option>
            <option value="partikel-ke-mol">Jumlah partikel → mol</option>
          </select>
        </label>

        <label class="mt-4 block">
          <span class="mb-2 block text-xs font-bold text-muted">Rumus zat</span>
          <input
            v-model="molFormula"
            type="text"
            class="w-full rounded-xl border border-line px-4 py-3 font-mono text-sm text-ink"
          />
        </label>

        <label class="mt-4 block">
          <span class="mb-2 block text-xs font-bold text-muted">
            {{
              molMode === 'massa-ke-mol'
                ? 'Massa (gram)'
                : molMode === 'mol-ke-massa'
                  ? 'Jumlah mol'
                  : 'Jumlah partikel'
            }}
          </span>
          <input
            v-model="molValue"
            type="number"
            min="0"
            step="any"
            class="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink"
          />
        </label>

        <p v-if="molMolarMass" class="mt-3 mb-0 text-xs text-muted">
          Massa molar {{ prettyFormula(molFormula) }} = {{ formatNumber(molMolarMass, 4) }} g/mol
        </p>
        <p v-else class="mt-3 mb-0 text-xs text-[#991b1b]">
          Rumus tidak dikenali atau massa atom tidak tersedia.
        </p>
      </div>

      <div
        class="rounded-card border border-navy/10 bg-[linear-gradient(135deg,#eef6ff_0%,#fff8f4_100%)] p-6"
        aria-live="polite"
      >
        <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">Hasil</p>
        <template v-if="molResult">
          <p
            class="mt-4 mb-0 font-display text-[clamp(1.8rem,5vw,3rem)] leading-none font-bold tracking-[-.05em] text-navy break-words"
          >
            {{ molResult.primary }}
          </p>
          <dl class="mt-5 space-y-2">
            <div
              v-for="[label, value] in molResult.rows"
              :key="label"
              class="flex items-baseline justify-between gap-3 border-b border-navy/5 pb-2 last:border-0"
            >
              <dt class="text-sm text-muted">{{ label }}</dt>
              <dd class="m-0 text-sm font-bold text-ink">{{ value }}</dd>
            </div>
          </dl>
        </template>
        <p v-else class="mt-4 mb-0 text-sm text-muted">Isi nilai untuk melihat hasil.</p>
      </div>
    </section>

    <!-- Larutan -->
    <section v-if="activeTab === 'larutan'" class="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div class="rounded-card border border-line bg-white p-6">
        <h2 class="m-0 font-display text-xl font-bold tracking-[-.04em] text-ink">
          Perhitungan larutan
        </h2>

        <label class="mt-4 block">
          <span class="mb-2 block text-xs font-bold text-muted">Jenis perhitungan</span>
          <select
            v-model="solutionMode"
            class="w-full cursor-pointer rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink"
          >
            <option value="molaritas">Molaritas dari mol dan volume</option>
            <option value="massa-molaritas">Molaritas dari massa zat</option>
            <option value="pengenceran">Pengenceran (M₁V₁ = M₂V₂)</option>
          </select>
        </label>

        <template v-if="solutionMode === 'molaritas'">
          <label class="mt-4 block">
            <span class="mb-2 block text-xs font-bold text-muted">Mol zat terlarut (mol)</span>
            <input
              v-model="solutionForm.moles"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-xl border border-line px-4 py-3 text-sm"
            />
          </label>
          <label class="mt-4 block">
            <span class="mb-2 block text-xs font-bold text-muted">Volume larutan (liter)</span>
            <input
              v-model="solutionForm.volume"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-xl border border-line px-4 py-3 text-sm"
            />
          </label>
        </template>

        <template v-else-if="solutionMode === 'massa-molaritas'">
          <label class="mt-4 block">
            <span class="mb-2 block text-xs font-bold text-muted">Massa zat terlarut (gram)</span>
            <input
              v-model="solutionForm.mass"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-xl border border-line px-4 py-3 text-sm"
            />
          </label>
          <label class="mt-4 block">
            <span class="mb-2 block text-xs font-bold text-muted">Massa molar (g/mol)</span>
            <input
              v-model="solutionForm.molarMass"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-xl border border-line px-4 py-3 text-sm"
            />
          </label>
          <label class="mt-4 block">
            <span class="mb-2 block text-xs font-bold text-muted">Volume larutan (liter)</span>
            <input
              v-model="solutionForm.volume"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-xl border border-line px-4 py-3 text-sm"
            />
          </label>
        </template>

        <template v-else>
          <p class="mt-3 mb-0 text-xs text-muted">Isi tiga nilai, kosongkan satu untuk dihitung.</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">M₁ (M)</span>
              <input
                v-model="solutionForm.m1"
                type="number"
                min="0"
                step="any"
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">V₁ (L)</span>
              <input
                v-model="solutionForm.v1"
                type="number"
                min="0"
                step="any"
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">M₂ (M)</span>
              <input
                v-model="solutionForm.m2"
                type="number"
                min="0"
                step="any"
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">V₂ (L)</span>
              <input
                v-model="solutionForm.v2"
                type="number"
                min="0"
                step="any"
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
          </div>
        </template>
      </div>

      <div
        class="rounded-card border border-navy/10 bg-[linear-gradient(135deg,#eef6ff_0%,#fff8f4_100%)] p-6"
        aria-live="polite"
      >
        <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">Hasil</p>
        <template v-if="solutionResult && !solutionResult.error">
          <p
            class="mt-4 mb-0 font-display text-[clamp(1.8rem,5vw,3rem)] leading-none font-bold tracking-[-.05em] text-navy"
          >
            {{ solutionResult.primary }}
          </p>
          <dl class="mt-5 space-y-2">
            <div
              v-for="[label, value] in solutionResult.rows"
              :key="label"
              class="flex items-baseline justify-between gap-3 border-b border-navy/5 pb-2 last:border-0"
            >
              <dt class="text-sm text-muted">{{ label }}</dt>
              <dd class="m-0 text-sm font-bold text-ink">{{ value }}</dd>
            </div>
          </dl>
        </template>
        <p
          v-else-if="solutionResult?.error"
          class="mt-4 mb-0 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]"
        >
          {{ solutionResult.error }}
        </p>
        <p v-else class="mt-4 mb-0 text-sm text-muted">Isi nilai untuk melihat hasil.</p>
      </div>
    </section>

    <aside class="mt-6 rounded-2xl border border-line bg-white px-5 py-4">
      <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-muted uppercase">
        Konstanta yang dipakai
      </p>
      <ul class="mt-2 mb-0 list-none space-y-1 p-0 text-sm text-[#39455e]">
        <li v-for="[label, value] in constants" :key="label">
          <span class="font-semibold text-ink">{{ label }}:</span> {{ value }}
        </li>
        <li>
          <span class="font-semibold text-ink">Bilangan Avogadro:</span>
          {{ AVOGADRO.toExponential(6) }} partikel/mol
        </li>
      </ul>
    </aside>
  </div>
</template>
