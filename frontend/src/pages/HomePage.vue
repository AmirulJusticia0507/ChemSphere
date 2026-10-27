<script setup>
import ExploreSection from '../components/ExploreSection.vue'
import HeroSection from '../components/HeroSection.vue'
import QuickStats from '../components/QuickStats.vue'
</script>

<template>
  <div class="shell">
    <HeroSection />
    <QuickStats />
    <ExploreSection />

    <section class="mt-24 overflow-hidden rounded-card bg-navy px-8 py-12 text-white sm:px-12">
      <div class="flex flex-wrap items-center justify-between gap-8">
        <div>
          <p class="m-0 text-[.7rem] font-bold tracking-[.14em] text-[#f0d56e] uppercase">
            118 unsur menanti
          </p>
          <h2 class="mt-2 mb-0 max-w-xl font-display text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-.055em]">
            Mulai dari satu unsur, pahami semuanya.
          </h2>
          <p class="mt-3 mb-0 max-w-lg text-sm leading-relaxed text-white/70">
            Cari berdasarkan nama, lambang, atau nomor atom. Klik unsur untuk melihat sifat,
            kegunaan, dan peringatan bahayanya.
          </p>
        </div>
        <RouterLink
          class="rounded-xl bg-coral px-6 py-3.5 text-sm font-bold text-navy no-underline"
          to="/tabel"
        >
          Buka tabel periodik →
        </RouterLink>
      </div>
    </section>
  </div>
</template>
