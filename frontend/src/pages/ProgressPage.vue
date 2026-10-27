<script setup>
import { computed, onMounted, ref } from 'vue'

import { getBookmarks, getProgress, removeBookmark } from '../services/api.js'
import { useAuth } from '../composables/useAuth.js'

const auth = useAuth()

const bookmarks = ref([])
const progress = ref(null)
const loading = ref(true)
const error = ref('')

const TOPIC_LABELS = {
  campuran: 'Campuran',
  simbol: 'Simbol unsur',
  'nomor-atom': 'Nomor atom',
  kategori: 'Kategori',
  'golongan-periode': 'Golongan & periode',
}

const hasData = computed(() => bookmarks.value.length > 0 || (progress.value?.attempts ?? 0) > 0)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [bookmarkData, progressData] = await Promise.all([getBookmarks(), getProgress()])
    bookmarks.value = bookmarkData
    progress.value = progressData
  } catch (loadError) {
    error.value = loadError.message ?? 'Progres tidak dapat dimuat.'
  } finally {
    loading.value = false
  }
}

async function drop(elementId) {
  try {
    await removeBookmark(elementId)
    bookmarks.value = bookmarks.value.filter((item) => item.elementId !== elementId)
    if (progress.value) progress.value.bookmarkCount = bookmarks.value.length
  } catch (removeError) {
    error.value = removeError.message ?? 'Gagal menghapus simpanan.'
  }
}

onMounted(load)
</script>

<template>
  <div class="shell pt-10 pb-16">
    <nav class="mb-8 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/">Beranda</RouterLink>
      <span class="mx-2">/</span><span class="text-ink">Progres</span>
    </nav>

    <header class="mb-8">
      <h1 class="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-.05em] text-ink">
        Progres belajar
      </h1>
      <p class="mt-2 mb-0 text-sm text-muted">
        Simpanan unsur dan riwayat kuis untuk akun {{ auth.user.value?.name }}.
      </p>
    </header>

    <div
      v-if="!auth.isAuthenticated.value"
      class="rounded-card border border-line bg-white p-8 text-center"
    >
      <p class="m-0 font-display text-xl font-bold text-ink">Masuk dulu untuk melihat progres</p>
      <RouterLink
        to="/masuk"
        class="mt-5 inline-block rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white no-underline"
        >Masuk</RouterLink
      >
    </div>

    <template v-else>
      <p
        v-if="error"
        class="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]"
        role="alert"
      >
        {{ error }}
      </p>

      <div
        v-if="loading"
        class="rounded-card border border-line bg-white p-8 text-center text-sm text-muted"
        aria-busy="true"
      >
        Memuat progres…
      </div>

      <template v-else>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-card border border-line bg-white p-5">
            <p class="m-0 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
              Unsur disimpan
            </p>
            <p class="mt-1 mb-0 font-display text-3xl font-bold text-navy">
              {{ progress?.bookmarkCount ?? 0 }}
            </p>
          </div>
          <div class="rounded-card border border-line bg-white p-5">
            <p class="m-0 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
              Kuis dikerjakan
            </p>
            <p class="mt-1 mb-0 font-display text-3xl font-bold text-navy">
              {{ progress?.attempts ?? 0 }}
            </p>
          </div>
          <div class="rounded-card border border-line bg-white p-5">
            <p class="m-0 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
              Skor rata-rata
            </p>
            <p class="mt-1 mb-0 font-display text-3xl font-bold text-navy">
              {{ progress?.averageScore ?? '—' }}
            </p>
          </div>
          <div class="rounded-card border border-line bg-white p-5">
            <p class="m-0 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase">
              Skor terbaik
            </p>
            <p class="mt-1 mb-0 font-display text-3xl font-bold text-navy">
              {{ progress?.bestScore ?? '—' }}
            </p>
          </div>
        </div>

        <div
          v-if="progress?.weakestTopics?.length"
          class="mt-5 rounded-card border border-[#fed7aa] bg-[#fff7ed] p-5"
        >
          <p class="m-0 text-[.68rem] font-bold tracking-[.1em] text-[#9a3412] uppercase">
            Perlu latihan lagi
          </p>
          <ul class="mt-2 mb-0 list-none space-y-1 p-0 text-sm text-[#7c2d12]">
            <li v-for="item in progress.weakestTopics" :key="item.topic">
              <span class="font-bold">{{ TOPIC_LABELS[item.topic] ?? item.topic }}</span>
              — rata-rata {{ item.averageScore }} dari {{ item.attempts }} percobaan
            </li>
          </ul>
        </div>

        <div class="mt-8 grid gap-5 lg:grid-cols-2">
          <section class="rounded-card border border-line bg-white p-6">
            <div class="flex items-center justify-between gap-3">
              <h2 class="m-0 font-display text-lg font-bold tracking-[-.04em] text-ink">
                Unsur disimpan
              </h2>
              <RouterLink
                to="/tabel"
                class="text-xs font-bold text-navy no-underline hover:underline"
                >Tambah</RouterLink
              >
            </div>

            <p v-if="!bookmarks.length" class="mt-3 mb-0 text-sm text-muted">
              Belum ada unsur disimpan. Buka halaman detail unsur lalu tekan "Simpan".
            </p>
            <ul v-else class="mt-3 mb-0 list-none space-y-2 p-0">
              <li
                v-for="item in bookmarks"
                :key="item.id"
                class="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0"
              >
                <RouterLink :to="`/unsur/${item.element.id}`" class="min-w-0 no-underline">
                  <p class="m-0 text-sm font-bold text-ink">
                    {{ item.element.symbol }} — {{ item.element.nameId }}
                  </p>
                  <p class="m-0 text-xs text-muted">
                    No. {{ item.element.atomicNumber }} · {{ item.element.category?.name ?? '—' }}
                  </p>
                </RouterLink>
                <button
                  type="button"
                  class="cursor-pointer text-xs font-bold text-[#991b1b] hover:underline"
                  @click="drop(item.elementId)"
                >
                  Hapus
                </button>
              </li>
            </ul>
          </section>

          <section class="rounded-card border border-line bg-white p-6">
            <div class="flex items-center justify-between gap-3">
              <h2 class="m-0 font-display text-lg font-bold tracking-[-.04em] text-ink">
                Riwayat kuis
              </h2>
              <RouterLink
                to="/kuis"
                class="text-xs font-bold text-navy no-underline hover:underline"
                >Kuis baru</RouterLink
              >
            </div>

            <p v-if="!progress?.recentAttempts?.length" class="mt-3 mb-0 text-sm text-muted">
              Belum ada kuis dikerjakan.
            </p>
            <ul v-else class="mt-3 mb-0 list-none space-y-2 p-0">
              <li
                v-for="attempt in progress.recentAttempts"
                :key="attempt.id"
                class="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0"
              >
                <div>
                  <p class="m-0 text-sm font-semibold text-ink">
                    {{ TOPIC_LABELS[attempt.topic] ?? attempt.topic }}
                  </p>
                  <p class="m-0 text-xs text-muted">{{ formatDate(attempt.createdAt) }}</p>
                </div>
                <span class="font-display text-lg font-bold text-navy">{{ attempt.score }}</span>
              </li>
            </ul>
          </section>
        </div>

        <p v-if="!hasData" class="mt-6 text-sm text-muted">
          Mulai dengan menyimpan beberapa unsur atau mengerjakan kuis pertama.
        </p>
      </template>
    </template>
  </div>
</template>
