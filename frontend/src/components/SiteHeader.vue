<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const auth = useAuth()
const mobileMenuOpen = ref(false)

const links = [
  { label: 'Beranda', to: '/', match: (path) => path === '/' },
  { label: 'Tabel periodik', to: '/tabel', match: (path, hash) => path.startsWith('/tabel') || path.startsWith('/unsur') },
  { label: 'Ion poliatomik', to: '/tabel#ion', match: (path, hash) => path === '/tabel' && hash === '#ion' },
]

const activeIndex = computed(() => {
  const index = links.findIndex((link) => link.match(route.path, route.hash))
  return index === 2 && route.hash !== '#ion' ? 1 : index
})

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>

<template>
  <header class="shell relative flex h-[82px] items-center justify-between max-md:h-[70px]">
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-ink/10 md:hidden"
      aria-hidden="true"
      @click="mobileMenuOpen = false"
    ></div>
    <RouterLink
      class="font-display text-[1.35rem] font-bold tracking-[-.05em] text-ink no-underline"
      to="/"
      aria-label="ChemSphere beranda"
    >
      <span class="mr-[7px] text-coral" aria-hidden="true">◉</span>ChemSphere
    </RouterLink>

    <nav class="flex gap-[30px] max-md:hidden" aria-label="Navigasi utama">
      <RouterLink
        v-for="(link, index) in links"
        :key="link.label"
        :to="link.to"
        class="text-[.93rem] font-semibold no-underline transition-colors"
        :class="index === activeIndex ? 'text-ink' : 'text-muted hover:text-ink'"
        :aria-current="index === activeIndex ? 'page' : undefined"
      >
        {{ link.label }}
      </RouterLink>

      <RouterLink
        v-if="auth.isAdmin"
        to="/admin"
        class="text-[.93rem] font-semibold text-navy hover:text-ink"
        aria-label="Panel admin"
      >
        Admin
      </RouterLink>

      <template v-if="!auth.isAuthenticated">
        <RouterLink to="/masuk" class="text-[.93rem] font-semibold text-navy hover:text-ink">Masuk</RouterLink>
      </template>
      <template v-else>
        <button
          @click="auth.signOut"
          class="text-[.93rem] font-semibold text-coral-ink hover:underline"
          type="button"
        >
          Keluar
        </button>
      </template>
    </nav>

    <div class="flex items-center gap-3 md:hidden">
      <RouterLink
        to="/tabel"
        class="rounded-full bg-navy px-4 py-2 text-[.78rem] font-bold text-white no-underline"
      >
        Tabel
      </RouterLink>

      <button
        class="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-navy text-white"
        type="button"
        :aria-expanded="mobileMenuOpen"
        aria-controls="menu-mobile"
        :aria-label="mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <svg
          v-if="!mobileMenuOpen"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <button
      class="h-[38px] w-[38px] cursor-pointer rounded-full border-0 bg-navy font-bold text-white max-md:hidden"
      type="button"
      aria-label="Buka profil"
    >
      AR
    </button>

    <nav
      v-if="mobileMenuOpen"
      id="menu-mobile"
      class="absolute left-0 right-0 top-full z-50 flex flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,.12)] md:hidden"
      aria-label="Navigasi menu"
      @keydown.escape="mobileMenuOpen = false"
    >
      <RouterLink
        v-for="(link, index) in links"
        :key="link.label"
        :to="link.to"
        class="rounded-xl px-4 py-3 text-[.95rem] font-semibold no-underline transition-colors"
        :class="index === activeIndex ? 'bg-paper text-ink' : 'text-muted hover:bg-paper hover:text-ink'"
        :aria-current="index === activeIndex ? 'page' : undefined"
      >
        {{ link.label }}
      </RouterLink>

      <RouterLink
        v-if="auth.isAdmin"
        to="/admin"
        class="rounded-xl px-4 py-3 text-[.95rem] font-semibold text-navy no-underline hover:bg-paper hover:text-ink"
      >
        Admin
      </RouterLink>

      <RouterLink
        v-if="!auth.isAuthenticated"
        to="/masuk"
        class="rounded-xl px-4 py-3 text-[.95rem] font-semibold text-navy no-underline hover:bg-paper hover:text-ink"
      >
        Masuk
      </RouterLink>
      <button
        v-else
        @click="auth.signOut"
        class="rounded-xl px-4 py-3 text-left text-[.95rem] font-semibold text-coral-ink hover:bg-paper"
        type="button"
      >
        Keluar
      </button>
    </nav>
  </header>
</template>
