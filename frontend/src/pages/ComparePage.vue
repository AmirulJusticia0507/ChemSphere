<script setup>
import { computed, onMounted, ref } from 'vue'
import { useElementsStore } from '../stores/elements.js'

const store = useElementsStore()
const selected = ref([])
const elements = computed(() => store.all)
const compared = computed(() =>
  elements.value.filter((element) => selected.value.includes(element.id)),
)
const fields = [
  ['Nomor atom', 'atomicNumber'],
  ['Massa atom', 'atomicMass'],
  ['Golongan', 'group'],
  ['Periode', 'period'],
  ['Konfigurasi elektron', 'electronConfig'],
  ['Elektronegativitas', 'electronegativity'],
]
function toggle(id) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((value) => value !== id)
    : selected.value.length < 4
      ? [...selected.value, id]
      : selected.value
}
onMounted(() => store.ensureLoaded())
</script>

<template>
  <div class="shell py-10 pb-16">
    <p class="text-xs font-bold tracking-[.14em] text-coral-ink uppercase">Alat belajar</p>
    <h1 class="m-0 font-display text-4xl font-bold tracking-[-.05em]">Bandingkan unsur</h1>
    <p class="mt-3 text-muted">Pilih sampai empat unsur untuk membandingkan sifat dasarnya.</p>
    <div class="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="element in elements"
        :key="element.id"
        type="button"
        class="rounded-xl border px-3 py-2 text-left text-sm font-semibold"
        :class="
          selected.includes(element.id)
            ? 'border-navy bg-navy text-white'
            : 'border-line bg-white text-ink'
        "
        :disabled="selected.length === 4 && !selected.includes(element.id)"
        @click="toggle(element.id)"
      >
        {{ element.symbol }} — {{ element.nameId }}
      </button>
    </div>
    <p v-if="!compared.length" class="mt-6 text-sm text-muted">Pilih minimal satu unsur.</p>
    <div v-else class="mt-6 overflow-x-auto rounded-card border border-line bg-white">
      <table class="w-full min-w-[580px] text-left text-sm">
        <thead>
          <tr class="border-b border-line">
            <th class="p-4">Sifat</th>
            <th v-for="element in compared" :key="element.id" class="p-4">
              {{ element.symbol }} <span class="text-muted">{{ element.nameId }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="[label, key] in fields" :key="key" class="border-b border-line last:border-0">
            <th class="p-4 text-muted">{{ label }}</th>
            <td v-for="element in compared" :key="element.id" class="p-4 font-semibold">
              {{ element[key] ?? '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
