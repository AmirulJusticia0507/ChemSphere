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
        <p class="mt-0 mb-[13px] text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">
          Mulai dari sini
        </p>
        <h2 class="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-.055em]">
          Pilih cara belajarmu
        </h2>
      </div>
      <RouterLink class="text-[.88rem] font-bold text-ink no-underline max-md:hidden" to="/tabel">
        Lihat semua topik →
      </RouterLink>
    </div>

    <div class="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
      <article
        v-for="topic in topics"
        :key="topic.title"
        class="min-h-[230px] rounded-card p-[26px] max-md:min-h-0"
        :class="topic.tone"
      >
        <span
          class="mb-[31px] grid h-[46px] w-[46px] place-items-center rounded-[14px] bg-white/60 text-[1.45rem]"
        >
          {{ topic.icon }}
        </span>
        <h3 class="mt-0 mb-[10px] font-display text-[1.33rem] font-bold tracking-[-.055em]">
          {{ topic.title }}
        </h3>
        <p class="mt-0 mb-[15px] min-h-[43px] text-[.88rem] leading-[1.55] text-[#39455e] max-md:min-h-0">
          {{ topic.description }}
        </p>
        <RouterLink class="text-[.84rem] font-bold text-ink no-underline" :to="topic.to">
          Mulai →
        </RouterLink>
      </article>
    </div>
  </section>
</template>
