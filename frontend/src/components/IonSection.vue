<script setup>
import { computed, ref } from 'vue'

import IonDialog from './IonDialog.vue'

const props = defineProps({
  ions: { type: Array, default: () => [] },
})

const search = ref('')
const selectedIon = ref(null)

const filteredIons = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return props.ions

  return props.ions.filter((ion) =>
    [ion.name, ion.formula, ion.charge].some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(term),
    ),
  )
})

function isPositive(charge) {
  return String(charge).trim().startsWith('+') || String(charge).trim().startsWith('1')
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mt-0 mb-1.5 text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">
          Kamus singkat
        </p>
        <h2 class="m-0 font-display text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold tracking-[-.055em]">
          Ion poliatomik
        </h2>
        <p class="mt-2 mb-0 max-w-xl text-sm text-muted">
          Kelompok atom bermuatan yang sering muncul dalam reaksi dan penamaan senyawa. Klik untuk
          melihat detail.
        </p>
      </div>

      <label class="relative block w-full max-w-xs">
        <span class="sr-only">Cari ion poliatomik</span>
        <input
          v-model="search"
          type="search"
          placeholder="Cari ion, mis. sulfat"
          class="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
        />
      </label>
    </div>

    <div v-if="filteredIons.length" class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <button
        v-for="ion in filteredIons"
        :key="ion.id"
        type="button"
        class="group cursor-pointer rounded-2xl border border-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        @click="selectedIon = ion"
      >
        <span
          class="inline-flex rounded-full px-2 py-0.5 text-[.65rem] font-bold"
          :class="
            isPositive(ion.charge) ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#ffe0d6] text-[#9a3412]'
          "
        >
          {{ ion.charge }}
        </span>
        <span class="mt-2 block font-display text-xl font-bold tracking-[-.04em]">
          {{ ion.formula }}
        </span>
        <span class="mt-1 block text-xs text-muted">{{ ion.name }}</span>
      </button>
    </div>

    <p
      v-else
      class="rounded-2xl border border-dashed border-line bg-white/60 px-5 py-8 text-center text-sm text-muted"
    >
      Tidak ada ion yang cocok dengan pencarian “{{ search }}”.
    </p>

    <p class="mt-4 mb-0 text-xs text-muted">
      {{ filteredIons.length }} dari {{ ions.length }} ion ditampilkan.
    </p>

    <IonDialog v-if="selectedIon" :ion="selectedIon" @close="selectedIon = null" />
  </div>
</template>
