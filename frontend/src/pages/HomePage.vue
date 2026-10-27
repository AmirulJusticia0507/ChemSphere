<script setup>
import { computed, onMounted, ref } from 'vue'

import ExploreSection from '../components/ExploreSection.vue'
import HeroSection from '../components/HeroSection.vue'
import QuickStats from '../components/QuickStats.vue'
import { getElements } from '../services/api.js'

const elements = ref([])
const loading = ref(true)
const error = ref('')

const stats = computed(() => [
  { value: String(elements.value.length), label: 'Unsur kimia' },
  { value: '7', label: 'Periode' },
  { value: '18', label: 'Golongan' },
  { value: '∞', label: 'Rasa ingin tahu' },
])

async function load() {
  loading.value = true
  error.value = ''

  try {
    elements.value = await getElements()
  } catch (loadError) {
    error.value = loadError.message ?? 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="shell">
    <HeroSection />
    <QuickStats :stats="stats" :loading="loading" />

    <div
      v-if="error"
      role="alert"
      class="mb-10 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-5 py-4"
    >
      <p class="m-0 text-sm font-semibold text-[#991b1b]">Ringkasan data gagal dimuat.</p>
      <p class="mt-1 mb-3 text-sm text-[#991b1b]/80">{{ error }}</p>
      <button
        type="button"
        class="cursor-pointer rounded-lg bg-[#991b1b] px-4 py-2 text-xs font-bold text-white"
        @click="load"
      >
        Coba lagi
      </button>
    </div>

    <p
      v-else-if="!loading && elements.length === 0"
      class="mb-10 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-muted"
    >
      Belum ada data unsur. Muat ulang halaman atau hubungi admin bila masalah berlanjut.
    </p>

    <ExploreSection />

    <section
      class="relative mt-24 overflow-hidden rounded-card bg-[linear-gradient(180deg,#3d8fdb_0%,#3176b9_55%,#2f6aa4_100%)] px-8 py-14 text-white sm:px-12"
    >
      <div class="flex flex-wrap items-center justify-between gap-8">
        <div>
          <p class="label m-0 text-[#ffda3f]">
            {{ loading ? 'Memuat data unsur…' : `${elements.length} unsur menanti` }}
          </p>
          <h2 class="mt-3 mb-0 max-w-xl font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-.04em]">
            Mulai dari satu unsur, pahami semuanya.
          </h2>
          <p class="mt-3 mb-0 max-w-lg text-sm leading-relaxed text-white/80">
            Cari berdasarkan nama, lambang, atau nomor atom. Klik unsur untuk melihat sifat,
            kegunaan, dan peringatan bahayanya.
          </p>
        </div>
        <RouterLink
          class="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-mono text-[.72rem] font-medium tracking-[.14em] text-ink uppercase no-underline transition-transform duration-200 hover:scale-[1.03] active:scale-[.97]"
          to="/tabel"
        >
          Buka tabel periodik <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
