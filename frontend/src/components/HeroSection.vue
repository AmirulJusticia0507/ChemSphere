<script setup>
import { RouterLink } from 'vue-router'

import ElementCard from './ElementCard.vue'
</script>

<template>
  <section
    class="grid items-center gap-16 pt-[70px] pb-[50px] md:grid-cols-[1.18fr_.82fr] max-md:grid-cols-1 max-md:gap-[38px] max-md:pt-12"
  >
    <div>
      <p class="mt-0 mb-[13px] text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">
        Ruang belajar kimia
      </p>
      <h1
        class="m-0 max-w-[590px] font-display text-[clamp(3.3rem,7vw,6.2rem)] leading-[.94] font-bold tracking-[-.055em]"
      >
        Kimia terasa lebih <em class="text-coral not-italic">dekat.</em>
      </h1>
      <p class="mt-[25px] mb-[30px] max-w-[470px] text-[1.08rem] leading-[1.65] text-muted">
        Jelajahi unsur, pahami sifatnya, dan temukan keterkaitan di balik tabel periodik.
      </p>
      <div class="flex items-center gap-3">
        <RouterLink
          class="rounded-xl bg-navy px-[18px] py-[13px] text-[.9rem] font-bold text-white no-underline shadow-[0_9px_24px_#16213e33]"
          to="/tabel"
        >
          Jelajahi tabel <span class="ml-[14px]">→</span>
        </RouterLink>
        <a
          class="rounded-xl px-[18px] py-[13px] text-[.9rem] font-bold text-ink no-underline"
          href="#eksplorasi"
        >
          Mulai belajar
        </a>
      </div>
    </div>

    <ElementCard />
  </section>
</template>
