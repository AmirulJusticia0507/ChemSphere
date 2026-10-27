<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { useElementsStore } from '../stores/elements.js'
import { generateCompounds, molarMass } from '../utils/formula.js'

const elementsStore = useElementsStore()

const elements = ref([])
const firstSymbol = ref('H')
const secondSymbol = ref('O')
const loading = ref(true)
const error = ref('')

const nameBySymbol = computed(() => {
  const map = {}
  for (const element of elements.value) map[element.symbol] = element.nameId
  return map
})

const massBySymbol = computed(() => {
  const map = {}
  for (const element of elements.value) map[element.symbol] = Number(element.atomicMass)
  return map
})

const nameOf = (symbol) => nameBySymbol.value[symbol] ?? null

const selectedElements = computed(() => ({
  first: elements.value.find((element) => element.symbol === firstSymbol.value) ?? null,
  second: elements.value.find((element) => element.symbol === secondSymbol.value) ?? null,
}))

// Hasil dihitung ulang setiap pasangan berubah, tanpa data senyawa hardcoded.
const result = computed(() => generateCompounds(firstSymbol.value, secondSymbol.value, nameOf))

const activeIndex = ref(0)

watch([firstSymbol, secondSymbol], () => {
  activeIndex.value = 0
})

const activeCompound = computed(() => result.value.compounds[activeIndex.value] ?? null)

const activeMass = computed(() => {
  if (!activeCompound.value) return null
  const { total, missing } = molarMass(
    activeCompound.value.formula,
    (symbol) => massBySymbol.value[symbol],
  )
  if (missing.length) return null
  return total
})

const suggestions = [
  ['H', 'O'],
  ['Na', 'Cl'],
  ['C', 'O'],
  ['Fe', 'O'],
  ['Si', 'O'],
  ['N', 'H'],
  ['Ca', 'O'],
  ['Al', 'O'],
  ['S', 'O'],
  ['Mg', 'Cl'],
]

function choosePair(first, second) {
  firstSymbol.value = first
  secondSymbol.value = second
}

function swapElements() {
  const current = firstSymbol.value
  firstSymbol.value = secondSymbol.value
  secondSymbol.value = current
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    elements.value = await elementsStore.ensureLoaded()
  } catch (loadError) {
    error.value = loadError.message ?? 'Data unsur tidak dapat dimuat.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="shell pt-10 pb-16">
    <nav class="mb-8 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/">Beranda</RouterLink>
      <span class="mx-2">/</span><span class="text-ink">Lab eksperimen</span>
    </nav>

    <header
      class="relative isolate overflow-hidden rounded-card bg-navy px-6 py-10 text-white sm:px-10"
    >
      <span
        class="absolute -top-20 -right-12 -z-10 h-60 w-60 rounded-full border border-white/10"
      ></span>
      <p class="m-0 text-[.7rem] font-bold tracking-[.15em] text-[#f0d56e] uppercase">
        Ruang belajar interaktif
      </p>
      <h1
        class="mt-2 mb-0 max-w-2xl font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] font-bold tracking-[-.055em]"
      >
        Lab eksperimen unsur
      </h1>
      <p class="mt-4 mb-0 max-w-2xl text-sm leading-relaxed text-white/70">
        Pilih dua unsur dan lihat senyawa yang mungkin terbentuk dari aturan silang valensi. Ini
        simulasi konsep kimia, bukan panduan mencampur bahan di dunia nyata.
      </p>
    </header>

    <div v-if="loading" class="mt-8 space-y-4" aria-busy="true">
      <div class="h-52 animate-pulse rounded-card bg-white"></div>
      <p class="text-sm text-muted">Menyiapkan unsur…</p>
    </div>

    <div v-else-if="error" class="mt-8 rounded-card border border-[#fecaca] bg-[#fef2f2] p-6">
      <p class="m-0 font-bold text-[#991b1b]">Lab belum dapat dimuat</p>
      <p class="mt-2 text-sm text-[#991b1b]/80">{{ error }}</p>
      <button
        type="button"
        class="rounded-xl bg-[#991b1b] px-4 py-2 text-sm font-bold text-white"
        @click="load"
      >
        Coba lagi
      </button>
    </div>

    <template v-else>
      <section class="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div
          class="rounded-card border border-line bg-white p-5 shadow-[0_18px_55px_#17213d0d] sm:p-7"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">
                Pilih pasangan
              </p>
              <h2 class="mt-1 mb-0 font-display text-xl font-bold tracking-[-.04em] text-ink">
                Dua unsur, banyak kemungkinan
              </h2>
            </div>
            <button
              type="button"
              class="cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-xs font-bold text-ink hover:border-navy/30"
              @click="swapElements"
            >
              Tukar
            </button>
          </div>

          <div class="mt-6 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <label class="block">
              <span class="mb-2 block text-xs font-bold text-muted">Unsur pertama</span>
              <select
                v-model="firstSymbol"
                class="w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-3 text-sm font-semibold text-ink"
              >
                <option v-for="element in elements" :key="element.id" :value="element.symbol">
                  {{ element.symbol }} — {{ element.nameId }}
                </option>
              </select>
            </label>
            <span
              class="mb-3 text-center font-display text-2xl font-bold text-coral"
              aria-hidden="true"
              >+</span
            >
            <label class="block">
              <span class="mb-2 block text-xs font-bold text-muted">Unsur kedua</span>
              <select
                v-model="secondSymbol"
                class="w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-3 text-sm font-semibold text-ink"
              >
                <option v-for="element in elements" :key="element.id" :value="element.symbol">
                  {{ element.symbol }} — {{ element.nameId }}
                </option>
              </select>
            </label>
          </div>

          <div class="mt-6 border-t border-line pt-5">
            <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-muted uppercase">
              Coba cepat
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="pair in suggestions"
                :key="pair.join('-')"
                type="button"
                class="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink hover:border-navy/30 hover:bg-paper"
                @click="choosePair(pair[0], pair[1])"
              >
                {{ pair[0] }} + {{ pair[1] }}
              </button>
            </div>
          </div>
        </div>

        <section
          class="rounded-card border border-navy/10 bg-[linear-gradient(135deg,#eef6ff_0%,#fff8f4_100%)] p-6 sm:p-8"
          aria-live="polite"
        >
          <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">
            Hasil simulasi
          </p>

          <template v-if="result.compounds.length">
            <p class="mt-6 mb-0 text-sm font-semibold text-muted">
              {{ selectedElements.first?.nameId }} + {{ selectedElements.second?.nameId }}
            </p>
            <p
              class="mt-2 mb-1 font-display text-[clamp(2.6rem,7vw,4.4rem)] leading-none font-bold tracking-[-.06em] text-navy"
            >
              {{ activeCompound.display }}
            </p>
            <h2 class="mt-3 mb-0 font-display text-2xl font-bold tracking-[-.04em] text-ink">
              {{ activeCompound.name }}
            </h2>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span
                class="rounded-full bg-navy/8 px-3 py-1 text-[.68rem] font-bold tracking-[.08em] text-navy uppercase"
              >
                {{ activeCompound.type }}
              </span>
              <span
                v-if="activeMass"
                class="rounded-full bg-white px-3 py-1 text-[.68rem] font-bold text-muted"
              >
                Mᵣ ≈ {{ activeMass.toFixed(2) }} g/mol
              </span>
            </div>

            <p class="mt-4 mb-0 text-sm leading-relaxed text-[#39455e]">
              {{ activeCompound.description }}
            </p>

            <div v-if="result.compounds.length > 1" class="mt-6 border-t border-navy/10 pt-4">
              <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-muted uppercase">
                {{ result.compounds.length }} kemungkinan senyawa
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="(compound, index) in result.compounds"
                  :key="compound.formula"
                  type="button"
                  class="cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-bold transition"
                  :class="
                    index === activeIndex
                      ? 'border-navy bg-navy text-white'
                      : 'border-line bg-white text-ink hover:border-navy/30'
                  "
                  :aria-pressed="index === activeIndex"
                  @click="activeIndex = index"
                >
                  <span class="block font-display text-sm">{{ compound.display }}</span>
                  <span
                    class="block text-[.65rem] font-semibold"
                    :class="index === activeIndex ? 'text-white/70' : 'text-muted'"
                  >
                    {{ compound.name }}
                  </span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <p class="mt-6 mb-0 font-display text-2xl font-bold text-ink">
              Belum ada senyawa untuk pasangan ini.
            </p>
            <p class="mt-3 mb-0 text-sm leading-relaxed text-[#39455e]">{{ result.reason }}</p>
          </template>

          <div v-if="result.ions.length" class="mt-6 rounded-2xl bg-white/70 p-4">
            <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-muted uppercase">
              Ion poliatomik terkait
            </p>
            <ul class="mt-2 mb-0 list-none space-y-1 p-0">
              <li v-for="ion in result.ions" :key="ion.formula" class="text-sm text-[#39455e]">
                <span class="font-display font-bold text-navy">{{ ion.display }}</span> —
                {{ ion.name }}
              </li>
            </ul>
          </div>
        </section>
      </section>

      <aside
        class="mt-6 rounded-2xl border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-sm leading-relaxed text-[#7c2d12]"
      >
        <span class="font-bold">Catatan keselamatan:</span> jangan mencoba mencampur unsur atau
        bahan kimia berdasarkan simulasi ini. Rumus di sini mengikuti aturan valensi, bukan kondisi
        reaksi sebenarnya. Lakukan praktikum hanya di bawah pengawasan guru atau laboratorium yang
        sesuai.
      </aside>
    </template>
  </div>
</template>
