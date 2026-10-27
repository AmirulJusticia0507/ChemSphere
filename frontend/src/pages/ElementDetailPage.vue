<script setup>
import { computed, ref, watch } from 'vue'

import { styleForCategory } from '../data/categories.js'
import {
  getElement,
  getElements,
  addBookmark,
  removeBookmark,
  getBookmarks,
} from '../services/api.js'
import { useAuth } from '../composables/useAuth.js'
import { usePageMeta } from '../composables/usePageMeta.js'

const props = defineProps({
  id: { type: String, required: true },
})

const auth = useAuth()
const isBookmarked = ref(false)
const bookmarkBusy = ref(false)
const bookmarkNotice = ref('')

usePageMeta(() => {
  const el = element.value
  if (!el) return { title: 'Detail unsur' }
  const parts = [
    `${el.nameId} (${el.symbol})`,
    `nomor atom ${el.atomicNumber}`,
    el.category?.name ? `kategori ${el.category.name}` : null,
    `golongan ${el.group}, periode ${el.period}`,
  ].filter(Boolean)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ChemicalSubstance',
    name: el.nameId,
    alternateName: [el.nameLatin, el.symbol].filter(Boolean),
    identifier: el.symbol,
    chemicalFormula: el.symbol,
    description: (el.description ?? '').slice(0, 500),
    ...(Number(el.atomicMass)
      ? { molecularWeight: Number(el.atomicMass) }
      : {}),
    url: `https://chemsphere.vercel.app/unsur/${el.id}`,
    inLanguage: 'id',
  }
  return {
    title: `${el.nameId} (${el.symbol}) — Unsur ${el.atomicNumber}`,
    description: `${parts.join(', ')}. ${el.description ?? ''}`.trim().slice(0, 300),
    jsonLd,
  }
})

async function loadBookmarkState() {
  if (!auth.isAuthenticated.value) return
  try {
    const bookmarks = await getBookmarks()
    isBookmarked.value = bookmarks.some((item) => item.elementId === props.id)
  } catch {
    isBookmarked.value = false
  }
}

async function toggleBookmark() {
  bookmarkBusy.value = true
  bookmarkNotice.value = ''
  try {
    if (isBookmarked.value) {
      await removeBookmark(props.id)
      isBookmarked.value = false
      bookmarkNotice.value = 'Dihapus dari simpanan.'
    } else {
      await addBookmark(props.id)
      isBookmarked.value = true
      bookmarkNotice.value = 'Tersimpan di progres belajar.'
    }
  } catch (bookmarkError) {
    bookmarkNotice.value = bookmarkError.message ?? 'Gagal memperbarui simpanan.'
  } finally {
    bookmarkBusy.value = false
  }
}

const element = ref(null)
const allElements = ref([])
const loading = ref(true)
const error = ref('')

const palette = computed(() => styleForCategory(element.value?.category?.name))

const categoryProperties = {
  'logam alkali':
    'Sangat reaktif, lunak, dan mudah kehilangan satu elektron valensi membentuk ion +1.',
  'logam alkaline tanah':
    'Reaktif namun lebih stabil dari logam alkali, membentuk ion +2 dan banyak terdapat dalam mineral.',
  'logam alkali tanah':
    'Reaktif namun lebih stabil dari logam alkali, membentuk ion +2 dan banyak terdapat dalam mineral.',
  'logam transisi':
    'Memiliki ikatan logam kuat, konduktivitas listrik dan panas tinggi, serta sering berperan sebagai katalis.',
  'logam lemah':
    'Logam yang relatif lunak dengan titik leleh lebih rendah daripada logam transisi.',
  'logam pasca-transisi':
    'Logam yang relatif lunak dengan titik leleh lebih rendah daripada logam transisi.',
  metaloid: 'Bersifat di antara logam dan nonlogam sehingga banyak digunakan dalam elektronika.',
  nonlogam: 'Cenderung membentuk ikatan kovalen dan berperan penting dalam proses kehidupan.',
  halogen: 'Unsur sangat reaktif yang mudah membentuk garam dan bersifat oksidator.',
  'gas mulia': 'Kulit valensinya penuh sehingga sangat stabil dan sulit bereaksi.',
  lantanida: 'Logam reaktif yang penting untuk magnet permanen, fosfor, dan katalis.',
  aktinida: 'Bersifat radioaktif dan banyak digunakan dalam teknologi nuklir serta riset.',
}

const properties = computed(() => {
  const name = String(element.value?.category?.name ?? '').toLowerCase()
  return (
    categoryProperties[name] ??
    'Sifat spesifik unsur ini dapat dipelajari dari konfigurasi elektron dan posisinya pada tabel periodik.'
  )
})

function num(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatNumber(value, digits = 2) {
  const parsed = num(value)
  if (parsed === null) return null
  return parsed.toLocaleString('id-ID', { maximumFractionDigits: digits })
}

// Daftar properti fisika dan kimia yang benar-benar tersedia untuk unsur ini.
const physicalProperties = computed(() => {
  const el = element.value
  if (!el) return []

  const rows = []
  const push = (label, value, unit) => {
    if (value === null || value === undefined || value === '') return
    rows.push({ label, value, unit })
  }

  const melt = formatNumber(el.meltingPoint, 2)
  if (melt !== null) {
    const kelvin = num(el.meltingPoint)
    push('Titik leleh', `${melt} °C`, kelvin !== null ? `(${(kelvin + 273.15).toFixed(2)} K)` : '')
  }

  const boil = formatNumber(el.boilingPoint, 2)
  if (boil !== null) {
    const kelvin = num(el.boilingPoint)
    push('Titik didih', `${boil} °C`, kelvin !== null ? `(${(kelvin + 273.15).toFixed(2)} K)` : '')
  }

  push('Massa jenis', formatNumber(el.density, 4), 'g/cm³')
  push('Elektronegativitas', formatNumber(el.electronegativity, 2), 'Pauling')
  push('Energi ionisasi', formatNumber(el.ionizationEnergy, 1), 'kJ/mol')
  push('Jari-jari atom', formatNumber(el.atomicRadius, 0), 'pm')
  push('Jari-jari kovalen', formatNumber(el.covalentRadius, 0), 'pm')
  push('Kalor molar', formatNumber(el.molarHeat, 2), 'J/(mol·K)')
  push('Bilangan oksidasi', el.oxidationStates, '')
  push('Wujud (25 °C)', el.phaseAtRoomTemp, '')
  push('Blok', el.block, '')
  push('Penampilan', el.appearance, '')
  push('Ditemukan oleh', el.discoveredBy, '')

  if (el.yearDiscovered !== null && el.yearDiscovered !== undefined) {
    const year = Number(el.yearDiscovered)
    push('Tahun penemuan', year < 0 ? `${Math.abs(year)} SM` : String(year), '')
  }

  return rows
})

const neighbors = computed(() => {
  if (!element.value || !allElements.value.length) return { previous: null, next: null }

  const sorted = [...allElements.value].sort((a, b) => a.atomicNumber - b.atomicNumber)
  const index = sorted.findIndex((item) => item.id === element.value.id)

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
  }
})

function formatMass(mass) {
  const value = Number(mass)
  if (Number.isNaN(value)) return '—'
  return value.toLocaleString('id-ID', { maximumFractionDigits: 4 })
}

async function load() {
  loading.value = true
  error.value = ''
  element.value = null

  try {
    const data = await getElement(props.id)
    element.value = data
    document.title = `${data.nameId} (${data.symbol}) | ChemSphere`

    allElements.value = await getElements().catch(() => [])
  } catch (loadError) {
    error.value = loadError.message ?? 'Unsur tidak ditemukan.'
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: true })
watch(() => props.id, loadBookmarkState, { immediate: true })
</script>

<template>
  <div class="shell pt-10 pb-16">
    <nav class="mb-8 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/">Beranda</RouterLink>
      <span class="mx-2">/</span>
      <RouterLink class="text-muted no-underline hover:text-ink" to="/tabel"
        >Tabel periodik</RouterLink
      >
      <span class="mx-2">/</span>
      <span class="text-ink">{{ element?.nameId ?? 'Detail unsur' }}</span>
    </nav>

    <div v-if="loading" class="animate-pulse space-y-5" aria-busy="true" aria-live="polite">
      <div class="grid gap-8 lg:grid-cols-[.55fr_1fr]">
        <div class="aspect-square max-w-sm rounded-card bg-white"></div>
        <div class="space-y-4 py-4">
          <div class="h-10 w-2/3 rounded-lg bg-white"></div>
          <div class="h-4 w-1/3 rounded bg-white"></div>
          <div class="h-24 rounded-xl bg-white"></div>
        </div>
      </div>
      <p class="text-sm text-muted">Memuat detail unsur…</p>
    </div>

    <div
      v-else-if="error"
      class="rounded-card border border-[#fecaca] bg-[#fef2f2] px-6 py-10 text-center"
    >
      <h1 class="m-0 font-display text-2xl font-bold text-[#991b1b]">Unsur tidak dapat dimuat</h1>
      <p class="mt-2 mb-6 text-sm text-[#991b1b]/80">{{ error }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="cursor-pointer rounded-xl bg-[#991b1b] px-5 py-2.5 text-sm font-bold text-white"
          @click="load"
        >
          Coba lagi
        </button>
        <RouterLink
          class="rounded-xl border border-[#991b1b]/20 px-5 py-2.5 text-sm font-bold text-[#991b1b] no-underline"
          to="/tabel"
        >
          Kembali ke tabel
        </RouterLink>
      </div>
    </div>

    <template v-else-if="element">
      <header class="grid items-center gap-8 lg:grid-cols-[.55fr_1fr]">
        <div
          class="relative isolate aspect-square w-full max-w-sm overflow-hidden rounded-card p-7 shadow-[0_24px_60px_#24345a26]"
          :style="{ backgroundColor: palette.background, color: palette.foreground }"
        >
          <span
            class="absolute -top-16 -right-16 -z-10 h-56 w-56 rounded-full border border-current/10"
          ></span>
          <span
            class="absolute -top-14 -right-14 -z-10 h-56 w-56 scale-y-[.4] rotate-[55deg] rounded-full border border-current/10"
          ></span>

          <div class="flex h-full flex-col justify-between">
            <div class="flex items-start justify-between">
              <span class="text-sm font-bold opacity-70">{{ element.atomicNumber }}</span>
              <span class="rounded-full bg-white/50 px-3 py-1 text-[.65rem] font-bold">
                {{ element.category?.name ?? 'Unsur' }}
              </span>
            </div>
            <p
              class="m-0 text-center font-display text-[clamp(5rem,14vw,9rem)] leading-none font-bold tracking-[-.06em]"
            >
              {{ element.symbol }}
            </p>
            <div class="text-center">
              <p class="m-0 font-display text-2xl font-bold tracking-[-.04em]">
                {{ element.nameId }}
              </p>
              <p class="mt-1 mb-0 text-xs opacity-70">{{ formatMass(element.atomicMass) }} u</p>
            </div>
          </div>
        </div>

        <div>
          <p class="mt-0 mb-2 text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">
            Detail unsur
          </p>
          <h1
            class="m-0 font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.02] font-bold tracking-[-.055em]"
          >
            {{ element.nameId }}
            <span class="text-muted/70">({{ element.symbol }})</span>
          </h1>
          <p class="mt-2 mb-0 text-sm text-muted">Nama Latin: {{ element.nameLatin }}</p>

          <p class="mt-6 mb-6 max-w-2xl text-[1rem] leading-relaxed text-[#39455e]">
            {{ element.description ?? 'Deskripsi unsur ini belum tersedia.' }}
          </p>

          <div class="flex flex-wrap gap-2">
            <span
              class="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"
            >
              Periode {{ element.period }}
            </span>
            <span
              class="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"
            >
              Golongan {{ element.group }}
            </span>
            <span
              class="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"
            >
              Massa {{ formatMass(element.atomicMass) }} u
            </span>
          </div>

          <div v-if="auth.isAuthenticated.value" class="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="cursor-pointer rounded-xl border px-4 py-2 text-xs font-bold transition disabled:opacity-50"
              :class="
                isBookmarked
                  ? 'border-[#166534] bg-[#f0fdf4] text-[#166534]'
                  : 'border-line bg-white text-ink hover:border-navy/30'
              "
              :disabled="bookmarkBusy"
              @click="toggleBookmark"
            >
              {{ isBookmarked ? '✓ Tersimpan' : 'Simpan unsur' }}
            </button>
            <span v-if="bookmarkNotice" class="text-xs font-semibold text-muted">{{
              bookmarkNotice
            }}</span>
          </div>
        </div>
      </header>

      <section class="mt-12" aria-labelledby="data-unsur">
        <h2 id="data-unsur" class="m-0 mb-4 font-display text-xl font-bold tracking-[-.04em]">
          Data unsur
        </h2>
        <dl class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div class="rounded-2xl border border-line bg-white p-4">
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">Nomor atom</dt>
            <dd class="mt-1 mb-0 font-display text-lg font-bold">{{ element.atomicNumber }}</dd>
          </div>
          <div class="rounded-2xl border border-line bg-white p-4">
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">Massa atom</dt>
            <dd class="mt-1 mb-0 font-display text-lg font-bold">
              {{ formatMass(element.atomicMass) }} u
            </dd>
          </div>
          <div class="rounded-2xl border border-line bg-white p-4">
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">Golongan</dt>
            <dd class="mt-1 mb-0 font-display text-lg font-bold">{{ element.group }}</dd>
          </div>
          <div class="rounded-2xl border border-line bg-white p-4">
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">Periode</dt>
            <dd class="mt-1 mb-0 font-display text-lg font-bold">{{ element.period }}</dd>
          </div>
          <div class="rounded-2xl border border-line bg-white p-4">
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
              Konfigurasi elektron
            </dt>
            <dd class="mt-1 mb-0 font-display text-lg font-bold break-words">
              {{ element.electronConfig }}
            </dd>
          </div>
          <div class="rounded-2xl border border-line bg-white p-4">
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">Kategori</dt>
            <dd class="mt-1 mb-0 font-display text-lg font-bold">
              {{ element.category?.name ?? '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="physicalProperties.length" class="mt-10" aria-labelledby="sifat-fisika">
        <h2 id="sifat-fisika" class="m-0 mb-4 font-display text-xl font-bold tracking-[-.04em]">
          Sifat fisika dan kimia
        </h2>
        <dl class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="property in physicalProperties"
            :key="property.label"
            class="rounded-2xl border border-line bg-white p-4"
          >
            <dt class="text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
              {{ property.label }}
            </dt>
            <dd class="mt-1 mb-0 font-display text-base font-bold break-words">
              {{ property.value }}
              <span v-if="property.unit" class="ml-1 text-xs font-semibold text-muted">{{
                property.unit
              }}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="element.isotopes?.length" class="mt-10" aria-labelledby="isotop">
        <h2 id="isotop" class="m-0 mb-4 font-display text-xl font-bold tracking-[-.04em]">
          Isotop
        </h2>
        <div class="overflow-hidden rounded-card border border-line bg-white">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-line bg-paper text-left">
                <th class="px-4 py-3 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
                  Nomor massa
                </th>
                <th class="px-4 py-3 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
                  Kelimpahan
                </th>
                <th class="px-4 py-3 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
                  Waktu paruh
                </th>
                <th class="px-4 py-3 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
                  Radioaktif
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="isotope in element.isotopes"
                :key="isotope.id"
                class="border-b border-line/60 last:border-0"
              >
                <td class="px-4 py-3 font-semibold text-ink">
                  {{ element.symbol }}-{{ isotope.massNumber }}
                </td>
                <td class="px-4 py-3 text-muted">
                  {{ isotope.abundance ? `${isotope.abundance}%` : '—' }}
                </td>
                <td class="px-4 py-3 text-muted">{{ isotope.halfLife ?? '—' }}</td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2.5 py-1 text-[.65rem] font-bold uppercase"
                    :class="
                      isotope.isRadioactive
                        ? 'bg-[#fef2f2] text-[#991b1b]'
                        : 'bg-[#f0fdf4] text-[#166534]'
                    "
                  >
                    {{ isotope.isRadioactive ? 'Ya' : 'Tidak' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="mt-8 grid gap-4 lg:grid-cols-3">
        <section class="rounded-card border border-line bg-white p-6">
          <h2 class="mt-0 mb-3 font-display text-lg font-bold tracking-[-.04em]">Sifat umum</h2>
          <p class="m-0 text-sm leading-relaxed text-[#39455e]">{{ properties }}</p>
        </section>
        <section class="rounded-card border border-line bg-white p-6">
          <h2 class="mt-0 mb-3 font-display text-lg font-bold tracking-[-.04em]">Kegunaan</h2>
          <p class="m-0 text-sm leading-relaxed text-[#39455e]">
            {{ element.uses ?? 'Informasi kegunaan belum tersedia.' }}
          </p>
        </section>
        <section class="rounded-card border border-[#fed7aa] bg-[#fff7ed] p-6">
          <h2 class="mt-0 mb-3 font-display text-lg font-bold tracking-[-.04em] text-[#9a3412]">
            Peringatan bahaya
          </h2>
          <p class="m-0 text-sm leading-relaxed text-[#7c2d12]">
            {{ element.hazardWarning ?? 'Belum ada peringatan bahaya khusus yang tercatat.' }}
          </p>
        </section>
      </div>

      <nav
        class="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-8"
        aria-label="Navigasi unsur"
      >
        <RouterLink
          v-if="neighbors.previous"
          class="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink no-underline hover:border-navy/30"
          :to="`/unsur/${neighbors.previous.id}`"
        >
          ← {{ neighbors.previous.atomicNumber }}. {{ neighbors.previous.nameId }}
        </RouterLink>
        <span v-else></span>

        <RouterLink
          v-if="neighbors.next"
          class="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink no-underline hover:border-navy/30"
          :to="`/unsur/${neighbors.next.id}`"
        >
          {{ neighbors.next.atomicNumber }}. {{ neighbors.next.nameId }} →
        </RouterLink>
      </nav>
    </template>
  </div>
</template>
