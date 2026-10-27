<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import IonSection from '../components/IonSection.vue'
import PeriodicTable from '../components/PeriodicTable.vue'
import { styleForCategory } from '../data/categories.js'
import { getCategories, getElements, getIons } from '../services/api.js'

const route = useRoute()
const router = useRouter()

const elements = ref([])
const categories = ref([])
const ions = ref([])
const loading = ref(true)
const error = ref('')

const search = ref('')
const categoryFilter = ref('')
const groupFilter = ref('')
const periodFilter = ref('')

const groups = Array.from({ length: 18 }, (_, index) => index + 1)
const periods = Array.from({ length: 7 }, (_, index) => index + 1)

function stringQuery(value) {
  return typeof value === 'string' ? value : ''
}

function applyQueryFilters() {
  search.value = stringQuery(route.query.q)
  categoryFilter.value = stringQuery(route.query.kategori)

  const group = Number(stringQuery(route.query.golongan))
  groupFilter.value = groups.includes(group) ? String(group) : ''

  const period = Number(stringQuery(route.query.periode))
  periodFilter.value = periods.includes(period) ? String(period) : ''
}

function updateQuery() {
  const query = {}
  if (search.value.trim()) query.q = search.value.trim()
  if (categoryFilter.value) query.kategori = categoryFilter.value
  if (groupFilter.value) query.golongan = groupFilter.value
  if (periodFilter.value) query.periode = periodFilter.value

  const currentQuery = Object.fromEntries(
    Object.entries(route.query).filter(([, value]) => typeof value === 'string'),
  )
  if (JSON.stringify(currentQuery) !== JSON.stringify(query)) router.replace({ query })
}

const categoryOptions = computed(() => {
  if (categories.value.length) {
    return categories.value.map((category) => ({
      value: category.name,
      label: category.name,
      count: category._count?.elements ?? null,
    }))
  }

  const unique = new Map()
  for (const element of elements.value) {
    const name = element.category?.name
    if (!name) continue
    unique.set(name, (unique.get(name) ?? 0) + 1)
  }

  return [...unique].map(([name, count]) => ({ value: name, label: name, count }))
})

const activeFilterCount = computed(
  () => [search.value, categoryFilter.value, groupFilter.value, periodFilter.value].filter(Boolean).length,
)

function matches(element) {
  const term = search.value.trim().toLowerCase()
  const matchesSearch =
    !term ||
    [element.nameId, element.nameLatin, element.symbol, String(element.atomicNumber)].some((value) =>
      String(value ?? '').toLowerCase().includes(term),
    )
  const matchesCategory = !categoryFilter.value || element.category?.name === categoryFilter.value
  const matchesGroup = !groupFilter.value || element.group === Number(groupFilter.value)
  const matchesPeriod = !periodFilter.value || element.period === Number(periodFilter.value)

  return matchesSearch && matchesCategory && matchesGroup && matchesPeriod
}

const visibleCount = computed(() => elements.value.filter(matches).length)
const hasResults = computed(() => visibleCount.value > 0)

function resetFilters() {
  search.value = ''
  categoryFilter.value = ''
  groupFilter.value = ''
  periodFilter.value = ''
}

function scrollToHash() {
  if (!route.hash) return
  nextTick(() => {
    document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

async function load() {
  loading.value = true
  error.value = ''

  try {
    const [elementData, categoryData, ionData] = await Promise.all([
      getElements(),
      getCategories().catch(() => []),
      getIons().catch(() => []),
    ])

    elements.value = elementData
    categories.value = categoryData
    ions.value = ionData
    scrollToHash()
  } catch (loadError) {
    error.value = loadError.message ?? 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.hash, scrollToHash)
watch([search, categoryFilter, groupFilter, periodFilter], updateQuery)
watch(() => route.query, applyQueryFilters)

applyQueryFilters()
</script>

<template>
  <div class="shell pt-10 pb-16">
    <nav class="mb-8 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/">Beranda</RouterLink>
      <span class="mx-2">/</span>
      <span class="text-ink">Tabel periodik</span>
    </nav>

    <header class="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="mt-0 mb-2 text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">
          Referensi interaktif
        </p>
        <h1 class="m-0 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-bold tracking-[-.055em]">
          Tabel periodik
        </h1>
        <p class="mt-3 mb-0 max-w-xl text-[.98rem] leading-relaxed text-muted">
          118 unsur dalam Bahasa Indonesia. Cari, saring berdasarkan kategori, golongan, atau
          periode, lalu klik unsur untuk membuka detailnya.
        </p>
      </div>
      <RouterLink class="text-sm font-bold text-ink no-underline" to="/">
        ← Kembali ke beranda
      </RouterLink>
    </header>

    <div v-if="error" class="mb-8 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-5 py-4">
      <p class="m-0 text-sm font-semibold text-[#991b1b]">Data gagal dimuat.</p>
      <p class="mt-1 mb-3 text-sm text-[#991b1b]/80">{{ error }}</p>
      <button
        type="button"
        class="cursor-pointer rounded-lg bg-[#991b1b] px-4 py-2 text-xs font-bold text-white"
        @click="load"
      >
        Coba lagi
      </button>
    </div>

    <div v-if="loading" class="space-y-4" aria-busy="true" aria-live="polite">
      <div class="h-28 animate-pulse rounded-card bg-white"></div>
      <div class="h-[420px] animate-pulse rounded-card bg-white/80"></div>
      <p class="text-center text-sm text-muted">Memuat data unsur…</p>
    </div>

    <template v-else-if="!error">
      <section class="rounded-card border border-line bg-white p-4 shadow-[0_18px_55px_#17213d0d] sm:p-5">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,.7fr)_minmax(0,.7fr)_auto]">
          <label class="relative block">
            <span class="sr-only">Cari unsur</span>
            <span class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">⌕</span>
            <input
              v-model="search"
              type="search"
              placeholder="Cari nama, lambang, atau nomor atom…"
              class="w-full rounded-xl border border-line bg-paper py-2.5 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
            />
          </label>

          <label class="block">
            <span class="sr-only">Filter kategori</span>
            <select
              v-model="categoryFilter"
              class="w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
            >
              <option value="">Semua kategori</option>
              <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="sr-only">Filter golongan</span>
            <select
              v-model="groupFilter"
              class="w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
            >
              <option value="">Golongan</option>
              <option v-for="group in groups" :key="group" :value="group">{{ group }}</option>
            </select>
          </label>

          <label class="block">
            <span class="sr-only">Filter periode</span>
            <select
              v-model="periodFilter"
              class="w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
            >
              <option value="">Periode</option>
              <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
            </select>
          </label>

          <button
            type="button"
            class="cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
            :class="
              activeFilterCount
                ? 'border-navy bg-navy text-white'
                : 'border-line bg-paper text-muted'
            "
            :disabled="!activeFilterCount"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p class="m-0 text-xs font-semibold text-muted" aria-live="polite">
            {{ visibleCount }} dari {{ elements.length }} unsur ditampilkan
          </p>
          <p v-if="!hasResults" class="m-0 text-xs font-semibold text-coral-ink">
            Tidak ada unsur yang cocok. Coba kata kunci lain atau reset filter.
          </p>
        </div>
      </section>

      <section
        id="kategori"
        class="mt-6 scroll-mt-24 rounded-card border border-line bg-white/70 p-4 sm:p-5"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-[.68rem] font-bold tracking-[.12em] text-muted uppercase">
            Kategori
          </span>
          <button
            v-for="category in categoryOptions"
            :key="category.value"
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
            :class="
              categoryFilter === category.value
                ? 'border-navy bg-navy text-white'
                : 'border-line bg-white text-ink hover:border-navy/30'
            "
            @click="categoryFilter = categoryFilter === category.value ? '' : category.value"
          >
            <span
              class="h-2 w-2 rounded-full"
              :style="{ backgroundColor: styleForCategory(category.value).dot }"
            ></span>
            {{ category.label }}
          </button>
        </div>
      </section>

      <section class="mt-6 rounded-card border border-line bg-white p-3 shadow-[0_18px_55px_#17213d0d] sm:p-5">
        <div class="overflow-x-auto pb-2">
          <PeriodicTable :elements="elements" :matches="matches" />
        </div>
        <p class="mt-3 mb-0 text-center text-xs text-muted">
          Klik salah satu unsur untuk melihat detail lengkap.
        </p>
      </section>

      <section id="ion" class="mt-20 scroll-mt-24">
        <IonSection :ions="ions" />
      </section>

      <details class="mt-16 rounded-card border border-line bg-white/70 p-5">
        <summary class="cursor-pointer text-sm font-bold text-ink">
          Tabel periodik versi gambar (SVG Bahasa Indonesia)
        </summary>
        <p class="mt-3 mb-4 text-xs text-muted">
          Tampilan referensi asli, termasuk keterangan ion poliatomik.
          <a
            class="font-semibold text-ink underline"
            href="/assets/periodic-table-polyatomic-id.svg"
            target="_blank"
            rel="noopener"
          >
            Buka di tab baru
          </a>
        </p>
        <div class="overflow-auto rounded-2xl border border-line bg-white p-4">
          <img
            class="block h-auto w-full min-w-[690px]"
            src="/assets/periodic-table-polyatomic-id.svg"
            alt="Tabel periodik unsur dan ion poliatomik dalam Bahasa Indonesia"
            loading="lazy"
          />
        </div>
      </details>
    </template>
  </div>
</template>
