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
    <div
      class="pointer-events-none fixed inset-0 -z-20 bg-[linear-gradient(130deg,#fbfdff_0%,#f5f8ff_55%,#fff8f4_100%)]"
    ></div>
    <div
      class="pointer-events-none fixed -top-60 -right-36 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#98d9ff] opacity-30 blur-[80px]"
    ></div>
    <div
      class="pointer-events-none fixed top-[26rem] -left-60 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#ffc4b0] opacity-30 blur-[80px]"
    ></div>

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
