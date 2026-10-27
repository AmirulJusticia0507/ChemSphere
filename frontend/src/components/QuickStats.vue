<script setup>
defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section
    class="my-2 mb-28.75 grid grid-cols-4 border-y border-line py-5.75 max-md:mb-18.75 max-md:grid-cols-2 max-md:gap-y-5"
    aria-label="Ringkasan konten"
    :aria-busy="loading"
  >
    <template v-if="loading">
      <div
        v-for="index in 4"
        :key="index"
        class="grid gap-3 border-l border-line pl-6.25 first:border-l-0 first:pl-0 max-md:even:border-l-0 max-md:even:pl-0 max-md:nth-3:border-l-0 max-md:nth-3:pl-0"
      >
        <span class="block h-8 w-16 animate-pulse rounded-lg bg-white"></span>
        <span class="block h-4 w-24 animate-pulse rounded bg-white/70"></span>
      </div>
    </template>

    <template v-else>
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="grid gap-1.5 border-l border-line pl-6.25 first:border-l-0 first:pl-0 max-md:even:border-l-0 max-md:even:pl-0 max-md:nth-3:border-l-0 max-md:nth-3:pl-0"
      >
        <strong class="font-display text-[1.8rem] leading-none font-extrabold tracking-[-.03em]">
          {{ stat.value }}
        </strong>
        <span class="label text-muted">{{ stat.label }}</span>
      </div>
    </template>
  </section>
</template>
