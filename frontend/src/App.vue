<script setup>
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
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

    <SiteHeader />

    <main class="flex-1">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>
