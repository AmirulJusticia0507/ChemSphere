<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  total: { type: Number, default: 0 },
  limit: { type: Number, default: 10 },
})

const emit = defineEmits(['update:page'])

const pages = computed(() => {
  const total = props.totalPages
  const current = props.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, current, current - 1, current + 1])
  const result = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const withGaps = []
  for (let i = 0; i < result.length; i += 1) {
    withGaps.push(result[i])
    if (i < result.length - 1 && result[i + 1] - result[i] > 1) withGaps.push('…')
  }
  return withGaps
})

const rangeStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1))
const rangeEnd = computed(() => Math.min(props.page * props.limit, props.total))

function go(next) {
  if (next >= 1 && next <= props.totalPages) emit('update:page', next)
}
</script>

<template>
  <div v-if="totalPages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3">
    <p class="m-0 text-xs text-muted">
      Menampilkan <span class="font-semibold text-ink">{{ rangeStart }}–{{ rangeEnd }}</span> dari
      <span class="font-semibold text-ink">{{ total }}</span> data
    </p>

    <nav class="flex items-center gap-1" aria-label="Navigasi halaman">
      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page <= 1"
        aria-label="Halaman sebelumnya"
        @click="go(page - 1)"
      >
        ‹
      </button>

      <template v-for="(item, index) in pages" :key="index">
        <span v-if="item === '…'" class="px-2 text-sm text-muted">…</span>
        <button
          v-else
          type="button"
          class="grid h-9 min-w-9 place-items-center rounded-lg border px-3 text-sm font-semibold transition-colors"
          :class="
            item === page
              ? 'border-navy bg-navy text-white'
              : 'border-line bg-white text-ink hover:bg-paper'
          "
          :aria-current="item === page ? 'page' : undefined"
          @click="go(item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page >= totalPages"
        aria-label="Halaman berikutnya"
        @click="go(page + 1)"
      >
        ›
      </button>
    </nav>
  </div>
</template>
