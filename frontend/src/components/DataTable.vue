<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'Tidak ada data.' },
})

const colCount = computed(() => props.columns.length)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line bg-white/40">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="bg-white/60 text-muted">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 font-mono text-[.72rem] font-medium uppercase tracking-[.14em]"
              :class="col.align === 'right' ? 'text-right' : 'text-left'"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="row.id ?? rowIndex"
            class="bg-white transition-colors hover:bg-paper"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 align-middle"
              :class="[
                col.align === 'right' ? 'text-right' : 'text-left',
                col.cellClass ?? '',
              ]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>

          <tr v-if="!loading && rows.length === 0">
            <td :colspan="colCount" class="px-4 py-10 text-center text-muted">
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="loading"
      class="space-y-2 border-t border-line px-4 py-4"
      aria-live="polite"
    >
      <div class="h-4 w-1/3 animate-pulse rounded bg-white/70"></div>
      <div class="h-4 w-full animate-pulse rounded bg-white/50"></div>
      <div class="h-4 w-2/3 animate-pulse rounded bg-white/50"></div>
      <p class="text-center text-xs text-muted">Memuat data…</p>
    </div>
  </div>
</template>
