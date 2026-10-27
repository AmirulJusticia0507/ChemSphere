<script setup>
import { onMounted } from 'vue'

import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { useAuth } from './composables/useAuth.js'

const auth = useAuth()

onMounted(() => {
  if (auth.isAuthenticated.value) auth.fetchMe()
})
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-x-clip bg-paper font-sans text-ink">
    <a
      href="#konten-utama"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-navy focus:px-5 focus:py-3 focus:font-semibold focus:text-white focus:no-underline"
    >
      Lewati ke konten utama
    </a>

    <SiteHeader />

    <main id="konten-utama" class="flex-1" tabindex="-1">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>
