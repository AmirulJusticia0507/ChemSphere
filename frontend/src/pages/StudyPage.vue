<script setup>
import { computed, onMounted, ref } from 'vue'
import { useElementsStore } from '../stores/elements.js'

const store = useElementsStore()
const index = ref(0)
const flipped = ref(false)
const elements = computed(() => store.all)
const card = computed(() => elements.value[index.value] ?? null)
const trend = computed(() =>
  [...elements.value]
    .filter((item) => item.electronegativity != null)
    .sort((a, b) => Number(b.electronegativity) - Number(a.electronegativity))
    .slice(0, 10),
)
function next() {
  index.value = elements.value.length ? (index.value + 1) % elements.value.length : 0
  flipped.value = false
}
onMounted(() => store.ensureLoaded())
</script>
<template>
  <div class="shell py-10 pb-16">
    <h1 class="font-display text-4xl font-bold">Ruang belajar</h1>
    <section v-if="card" class="mt-6 grid gap-5 lg:grid-cols-2">
      <div class="rounded-card bg-navy p-8 text-center text-white">
        <p class="text-xs tracking-widest uppercase">Flashcard — klik kartu</p>
        <button
          type="button"
          class="mt-4 w-full rounded-2xl border border-white/20 p-10 text-center"
          @click="flipped = !flipped"
        >
          <strong class="font-display text-6xl">{{ flipped ? card.nameId : card.symbol }}</strong
          ><span class="mt-4 block text-white/70">{{
            flipped ? `${card.atomicNumber} · ${card.atomicMass} u` : 'Lihat nama & sifat'
          }}</span></button
        ><button class="mt-4 rounded-xl bg-white px-5 py-2 font-bold text-ink" @click="next">
          Berikutnya
        </button>
      </div>
      <div class="rounded-card border border-line bg-white p-6">
        <h2 class="font-display text-2xl font-bold">Tren elektronegativitas</h2>
        <ol class="mt-4 space-y-2">
          <li
            v-for="item in trend"
            :key="item.id"
            class="flex justify-between border-b border-line pb-2"
          >
            <span>{{ item.symbol }} — {{ item.nameId }}</span
            ><strong>{{ item.electronegativity }}</strong>
          </li>
        </ol>
      </div>
    </section>
    <section class="mt-5 rounded-card border border-line bg-white p-6">
      <h2 class="font-display text-2xl font-bold">Tabel kelarutan ringkas</h2>
      <table class="mt-4 w-full text-left text-sm">
        <tbody>
          <tr>
            <th>Nitrat, asetat, amonium</th>
            <td>Larut</td>
          </tr>
          <tr>
            <th>Klorida</th>
            <td>Larut, kecuali Ag⁺, Pb²⁺, Hg₂²⁺</td>
          </tr>
          <tr>
            <th>Sulfat</th>
            <td>Larut, kecuali Ba²⁺, Pb²⁺, Sr²⁺</td>
          </tr>
          <tr>
            <th>Karbonat, fosfat, hidroksida</th>
            <td>Umumnya tak larut, kecuali alkali dan amonium</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
