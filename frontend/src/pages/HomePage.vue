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

    <section class="mt-24 overflow-hidden rounded-card bg-navy px-8 py-12 text-white sm:px-12">
      <div class="flex flex-wrap items-center justify-between gap-8">
        <div>
          <p class="m-0 text-[.7rem] font-bold tracking-[.14em] text-[#f0d56e] uppercase">
            {{ loading ? 'Memuat data unsur…' : `${elements.length} unsur menanti` }}
          </p>
          <h2 class="mt-2 mb-0 max-w-xl font-display text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-.055em]">
            Mulai dari satu unsur, pahami semuanya.
          </h2>
          <p class="mt-3 mb-0 max-w-lg text-sm leading-relaxed text-white/70">
            Cari berdasarkan nama, lambang, atau nomor atom. Klik unsur untuk melihat sifat,
            kegunaan, dan peringatan bahayanya.
          </p>
        </div>
        <RouterLink
          class="rounded-xl bg-coral px-6 py-3.5 text-sm font-bold text-navy no-underline"
          to="/tabel"
        >
          Buka tabel periodik →
        </RouterLink>
      </div>
    </section>
  </div>
</template>
