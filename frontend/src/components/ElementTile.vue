<script setup>
import { computed } from 'vue'

import { styleForCategory } from '../data/categories.js'

const props = defineProps({
  element: { type: Object, required: true },
  dimmed: { type: Boolean, default: false },
  highlighted: { type: Boolean, default: false },
})

const palette = computed(() => styleForCategory(props.element.category?.name))
</script>

<template>
  <RouterLink
    :to="`/unsur/${element.id}`"
    class="group relative flex aspect-square flex-col justify-between rounded-md border border-black/5 p-1.5 no-underline transition duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
    :class="[
      dimmed ? 'opacity-20 saturate-0' : 'opacity-100',
      highlighted && !dimmed ? 'ring-2 ring-coral ring-offset-1' : '',
    ]"
    :style="{ backgroundColor: palette.background, color: palette.foreground }"
    :aria-label="`${element.nameId}, nomor atom ${element.atomicNumber}`"
    :aria-hidden="dimmed ? 'true' : undefined"
    :tabindex="dimmed ? -1 : undefined"
  >
    <span class="text-[9px] leading-none font-bold opacity-70">{{ element.atomicNumber }}</span>
    <span class="text-center font-display text-[clamp(.8rem,1.5vw,1.15rem)] leading-none font-bold">
      {{ element.symbol }}
    </span>
    <span class="truncate text-center text-[8px] leading-none opacity-80">
      {{ element.nameId }}
    </span>
  </RouterLink>
</template>
