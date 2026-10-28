<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { getIon } from '../services/api.js'
import { infoForIon } from '../data/ionInfo.js'

const props = defineProps({ id: { type: String, required: true } })
const ion = ref(null)
const error = ref('')

async function load() {
  ion.value = null
  error.value = ''
  try {
    ion.value = await getIon(props.id)
  } catch (loadError) {
    error.value = loadError.message ?? 'Ion tidak ditemukan.'
  }
}

onMounted(load)
watch(() => props.id, load)
</script>

<template>
  <div class="shell py-10 pb-16">
    <RouterLink class="text-sm font-semibold text-navy" to="/tabel#ion"
      >← Kembali ke ion</RouterLink
    >
    <p v-if="error" class="mt-6 rounded-xl bg-[#fef2f2] p-4 text-[#991b1b]">{{ error }}</p>
    <section v-else-if="ion" class="mt-6 rounded-card bg-navy p-8 text-white sm:p-12">
      <p class="m-0 text-xs font-bold tracking-[.15em] text-[#f0d56e] uppercase">Ion poliatomik</p>
      <h1 class="mt-3 mb-0 font-display text-4xl font-bold tracking-[-.05em]">{{ ion.name }}</h1>
      <p class="mt-4 font-display text-6xl font-bold text-[#f0d56e]">{{ ion.formula }}</p>
      <p class="mt-5 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
        Muatan {{ ion.charge }}
      </p>
    </section>
    <section v-if="ion" class="mt-5 rounded-card border border-line bg-white p-6">
      <h2 class="m-0 font-display text-xl font-bold">Tentang ion ini</h2>
      <p class="mt-3 leading-relaxed text-muted">
        {{ ion.description || infoForIon(ion.formula)?.description }}
      </p>
      <p
        v-if="infoForIon(ion.formula)?.example"
        class="mt-5 rounded-xl bg-paper p-4 text-sm text-ink"
      >
        <strong>Contoh senyawa:</strong> {{ infoForIon(ion.formula).example }}
      </p>
    </section>
  </div>
</template>
