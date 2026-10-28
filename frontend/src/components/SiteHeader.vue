<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { showSuccess } from '@/services/alert.js'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const sidebarOpen = ref(false)
const globalSearch = ref('')
const links = [
  { label: 'Beranda', hint: 'Mulai belajar', to: '/', match: (path) => path === '/' },
  {
    label: 'Tabel periodik',
    hint: '118 unsur',
    to: '/tabel',
    match: (path) => path.startsWith('/tabel') || path.startsWith('/unsur'),
  },
  {
    label: 'Eksperimen',
    hint: 'Simulasi senyawa',
    to: '/eksperimen',
    match: (path) => path === '/eksperimen',
  },
  {
    label: 'Kalkulator',
    hint: 'Alat hitung',
    to: '/kalkulator',
    match: (path) => path === '/kalkulator',
  },
  { label: 'Kuis', hint: 'Latihan soal', to: '/kuis', match: (path) => path === '/kuis' },
  {
    label: 'Progres',
    hint: 'Simpanan & skor',
    to: '/progres',
    match: (path) => path === '/progres',
  },
  {
    label: 'Ion poliatomik',
    hint: 'Kamus ion',
    to: '/tabel#ion',
    match: (path, hash) => path === '/tabel' && hash === '#ion',
  },
]
const activeIndex = computed(() => {
  const index = links.findIndex((link) => link.match(route.path, route.hash))
  return index === 6 && route.hash !== '#ion' ? 1 : index
})
function closeSidebar() {
  sidebarOpen.value = false
}
function onKeydown(event) {
  if (event.key === 'Escape') closeSidebar()
}
async function submitSearch() {
  const q = globalSearch.value.trim()
  if (!q) return
  await router.push({ name: 'table', query: { q } })
  closeSidebar()
}
async function signOut() {
  await auth.signOut()
  closeSidebar()
  await router.push({ name: 'home' })
  await showSuccess('Berhasil keluar', 'Sesi Anda telah diakhiri.')
}
watch(() => route.fullPath, closeSidebar)
watch(sidebarOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="shell flex h-[78px] items-center justify-between max-md:h-[68px]">
    <RouterLink
      class="font-display text-[1.35rem] font-bold tracking-[-.05em] text-ink no-underline"
      to="/"
      aria-label="ChemSphere beranda"
    >
      <span class="mr-[7px] text-coral" aria-hidden="true">◉</span>ChemSphere
    </RouterLink>
    <div class="flex items-center gap-3">
      <form class="hidden lg:block" role="search" @submit.prevent="submitSearch">
        <label class="sr-only" for="global-search">Cari unsur</label>
        <input
          id="global-search"
          v-model="globalSearch"
          type="search"
          placeholder="Cari unsur"
          class="w-40 rounded-full border border-line bg-white px-4 py-2 text-xs outline-none focus:border-navy"
        />
      </form>
      <RouterLink
        to="/eksperimen"
        class="hidden rounded-full border border-navy/10 bg-white px-4 py-2 text-xs font-bold text-ink no-underline shadow-sm hover:border-navy/30 sm:inline-flex"
        >Lab eksperimen</RouterLink
      >
      <RouterLink
        to="/kalkulator"
        class="hidden rounded-full border border-navy/10 bg-white px-4 py-2 text-xs font-bold text-ink no-underline shadow-sm hover:border-navy/30 md:inline-flex"
        >Kalkulator</RouterLink
      >
      <button
        type="button"
        class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-navy px-4 text-xs font-bold text-white shadow-sm transition hover:bg-ink"
        :aria-expanded="sidebarOpen"
        aria-controls="sidebar-navigasi"
        :aria-label="sidebarOpen ? 'Tutup navigasi' : 'Buka navigasi'"
        @click="sidebarOpen = !sidebarOpen"
      >
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            v-if="!sidebarOpen"
            d="M2 4.5h14M2 9h14M2 13.5h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M4 4l10 10M14 4 4 14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ sidebarOpen ? 'Tutup' : 'Menu' }}
      </button>
    </div>
  </header>

  <Teleport to="body">
    <div v-if="sidebarOpen" class="fixed inset-0 z-50" @keydown="onKeydown">
      <button
        type="button"
        class="absolute inset-0 w-full cursor-default bg-navy/40 backdrop-blur-sm"
        aria-label="Tutup navigasi"
        @click="closeSidebar"
      ></button>
      <aside
        id="sidebar-navigasi"
        class="absolute top-0 right-0 flex h-full w-[min(88vw,380px)] flex-col bg-white p-5 shadow-[-20px_0_60px_#17213d2b]"
        aria-label="Navigasi utama"
      >
        <div class="flex items-center justify-between border-b border-line pb-5">
          <p class="m-0 font-display text-xl font-bold tracking-[-.05em] text-ink">
            <span class="text-coral" aria-hidden="true">◉</span> ChemSphere
          </p>
          <button
            type="button"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-paper text-ink"
            aria-label="Tutup navigasi"
            @click="closeSidebar"
          >
            ×
          </button>
        </div>
        <nav class="mt-5 space-y-1">
          <form class="mb-4" role="search" @submit.prevent="submitSearch">
            <label class="sr-only" for="sidebar-search">Cari unsur</label>
            <input
              id="sidebar-search"
              v-model="globalSearch"
              type="search"
              placeholder="Cari unsur, simbol, nomor atom"
              class="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-navy"
            />
          </form>
          <RouterLink
            v-for="(link, index) in links"
            :key="link.label"
            :to="link.to"
            class="flex items-center justify-between rounded-2xl px-4 py-3.5 no-underline transition"
            :class="
              index === activeIndex ? 'bg-navy text-white shadow-sm' : 'text-ink hover:bg-paper'
            "
            :aria-current="index === activeIndex ? 'page' : undefined"
          >
            <span class="font-semibold">{{ link.label }}</span>
            <span
              class="text-[.68rem]"
              :class="index === activeIndex ? 'text-white/60' : 'text-muted'"
              >{{ link.hint }}</span
            >
          </RouterLink>
        </nav>
        <div class="mt-auto rounded-2xl bg-paper p-4">
          <RouterLink
            v-if="auth.canManageContent"
            to="/admin"
            class="mb-3 block text-sm font-bold text-navy no-underline"
            >Panel admin</RouterLink
          >
          <RouterLink
            v-if="!auth.isAuthenticated"
            to="/masuk"
            class="block rounded-xl bg-navy px-4 py-3 text-center text-sm font-bold text-white no-underline"
            >Masuk</RouterLink
          >
          <button
            v-else
            type="button"
            class="w-full cursor-pointer rounded-xl bg-[#fff0eb] px-4 py-3 text-sm font-bold text-coral-ink"
            @click="signOut"
          >
            Keluar
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
