<script setup>
import { RouterLink } from 'vue-router'

import ElementCard from './ElementCard.vue'
</script>

<template>
  <section
    class="grid items-center gap-16 pt-[70px] pb-[50px] md:grid-cols-[1.18fr_.82fr] max-md:grid-cols-1 max-md:gap-[38px] max-md:pt-12"
  >
    <div>
      <p class="label mt-0 mb-[13px] inline-flex items-center gap-2 text-muted">
        <span class="text-coral-ink">[</span> Ruang belajar kimia
        <span class="text-coral-ink">]</span>
      </p>
      <h1
        class="m-0 max-w-[590px] font-display text-[clamp(3.3rem,7vw,6.2rem)] leading-[.95] font-extrabold tracking-[-.04em]"
      >
        Kimia terasa lebih <em class="text-coral-ink not-italic">dekat.</em>
      </h1>
      <p class="mt-[25px] mb-[30px] max-w-[470px] text-[1.08rem] leading-[1.65] text-muted">
        Jelajahi unsur, pahami sifatnya, dan temukan keterkaitan di balik tabel periodik.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          class="inline-flex items-center gap-3 rounded-full bg-navy px-7 py-4 font-mono text-[.72rem] font-medium tracking-[.14em] text-white uppercase no-underline transition-transform duration-200 hover:scale-[1.03] active:scale-[.97]"
          to="/tabel"
        >
          Jelajahi tabel <span aria-hidden="true">→</span>
        </RouterLink>
        <a
          class="inline-flex items-center rounded-full border border-[#060606d9] px-7 py-4 font-mono text-[.72rem] font-medium tracking-[.14em] text-ink uppercase no-underline transition hover:bg-[#0606060d]"
          href="#eksplorasi"
        >
          Mulai belajar
        </a>
      </div>
    </div>

    <ElementCard />
  </section>
</template>
