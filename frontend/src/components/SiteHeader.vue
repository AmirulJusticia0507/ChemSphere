<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const auth = useAuth()

const links = [
  { label: 'Beranda', to: '/', match: (path) => path === '/' },
  { label: 'Tabel periodik', to: '/tabel', match: (path, hash) => path.startsWith('/tabel') || path.startsWith('/unsur') },
  { label: 'Ion poliatomik', to: '/tabel#ion', match: (path, hash) => path === '/tabel' && hash === '#ion' },
]

const activeIndex = computed(() => {
  const index = links.findIndex((link) => link.match(route.path, route.hash))
  return index === 2 && route.hash !== '#ion' ? 1 : index
})
</script>

<template>
  <header class="shell flex h-[82px] items-center justify-between max-md:h-[70px]">
    <RouterLink
      class="font-display text-[1.35rem] font-bold tracking-[-.05em] text-ink no-underline"
      to="/"
      aria-label="ChemSphere beranda"
    >
      <span class="mr-[7px] text-coral">◉</span>ChemSphere
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
          class="text-[.93rem] font-semibold text-coral hover:underline"
          type="button"
        >
          Keluar
        </button>
      </template>
    </nav>

    <RouterLink
      to="/tabel"
      class="rounded-full bg-navy px-4 py-2 text-[.78rem] font-bold text-white no-underline md:hidden"
    >
      Tabel
    </RouterLink>

    <button
      class="h-[38px] w-[38px] cursor-pointer rounded-full border-0 bg-navy font-bold text-white max-md:hidden"
      type="button"
      aria-label="Buka profil"
    >
      AR
    </button>
  </header>
</template>
