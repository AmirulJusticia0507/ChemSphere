<script setup>
import { RouterLink } from 'vue-router'

const topics = [
  {
    icon: '⚛',
    title: 'Kenali unsur',
    description: 'Pelajari karakter setiap unsur dari hidrogen hingga oganeson.',
    to: '/tabel',
    tone: 'bg-[#ffe3d9]',
  },
  {
    icon: '⌘',
    title: 'Ion poliatomik',
    description: 'Temukan kelompok atom bermuatan yang sering muncul dalam reaksi.',
    to: '/tabel#ion',
    tone: 'bg-sky',
  },
  {
    icon: '◌',
    title: 'Kelompok unsur',
    description: 'Bandingkan logam, nonlogam, dan karakter unsur lainnya.',
    to: '/tabel#kategori',
    tone: 'bg-mint',
  },
]
</script>

<template>
  <section id="eksplorasi">
    <div class="mb-[27px] flex items-end justify-between gap-[25px] max-md:items-start">
      <div>
        <p class="label mt-0 mb-[13px] inline-flex items-center gap-2 text-muted">
          <span class="text-coral-ink">[</span> Mulai dari sini
          <span class="text-coral-ink">]</span>
        </p>
        <h2 class="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-.04em]">
          Pilih cara belajarmu
        </h2>
      </div>
      <RouterLink
        class="label text-ink no-underline transition hover:text-coral-ink max-md:hidden"
        to="/tabel"
      >
        Lihat semua topik →
      </RouterLink>
    </div>

    <div class="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
      <article
        v-for="topic in topics"
        :key="topic.title"
        class="min-h-[230px] rounded-card border border-line bg-white p-[26px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(6,6,6,.25)] max-md:min-h-0"
      >
        <span
          class="mb-[31px] grid h-[46px] w-[46px] place-items-center rounded-[14px] text-[1.45rem]"
          :class="topic.tone"
        >
          {{ topic.icon }}
        </span>
        <h3 class="mt-0 mb-[10px] font-display text-[1.33rem] font-bold tracking-[-.03em]">
          {{ topic.title }}
        </h3>
        <p
          class="mt-0 mb-[15px] min-h-[43px] text-[.88rem] leading-[1.55] text-muted max-md:min-h-0"
        >
          {{ topic.description }}
        </p>
        <RouterLink
          class="label text-ink no-underline transition hover:text-coral-ink"
          :to="topic.to"
        >
          Mulai →
        </RouterLink>
      </article>
    </div>
  </section>
</template>
