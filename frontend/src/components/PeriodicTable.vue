<script setup>
import { computed } from 'vue'

import { isActinide, isFBlock, isLanthanide } from '../data/categories.js'
import ElementTile from './ElementTile.vue'

const props = defineProps({
  elements: { type: Array, required: true },
  matches: { type: Function, required: true },
})

const mainElements = computed(() => props.elements.filter((element) => !isFBlock(element)))
const lanthanides = computed(() =>
  props.elements.filter((element) => isLanthanide(element.atomicNumber)),
)
const actinides = computed(() =>
  props.elements.filter((element) => isActinide(element.atomicNumber)),
)

const gridStyle = {
  gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
}

const fBlockGridStyle = {
  gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
}

function tileProps(element) {
  return {
    element,
    dimmed: !props.matches(element),
    highlighted: false,
  }
}
</script>

<template>
  <div class="min-w-[880px]">
    <div class="grid gap-1" :style="gridStyle" role="list" aria-label="Tabel periodik unsur">
      <div
        v-for="element in mainElements"
        :key="element.id"
        :style="{ gridColumn: element.group, gridRow: element.period }"
        role="listitem"
      >
        <ElementTile v-bind="tileProps(element)" />
      </div>

      <a
        v-if="lanthanides.length"
        href="#lantanida"
        class="flex aspect-square items-center justify-center rounded-md border border-dashed border-[#9d174d]/30 bg-[#fce7f3]/60 text-[8px] font-bold text-[#9d174d] no-underline sm:text-[10px]"
        :style="{ gridColumn: 3, gridRow: 6 }"
      >
        57–71
      </a>
      <a
        v-if="actinides.length"
        href="#aktinida"
        class="flex aspect-square items-center justify-center rounded-md border border-dashed border-[#7c2d12]/30 bg-[#ffedd5]/60 text-[8px] font-bold text-[#7c2d12] no-underline sm:text-[10px]"
        :style="{ gridColumn: 3, gridRow: 7 }"
      >
        89–103
      </a>
    </div>

    <div
      v-if="lanthanides.length || actinides.length"
      class="mt-4 space-y-1.5 pl-[calc(100%/18*2)]"
    >
      <div v-if="lanthanides.length" id="lantanida" class="scroll-mt-24">
        <p class="mb-1 ml-0.5 text-[9px] font-bold tracking-[.12em] text-[#9d174d] uppercase">
          Lantanida
        </p>
        <div class="grid gap-1" :style="fBlockGridStyle" role="list" aria-label="Deret lantanida">
          <div
            v-for="(element, index) in lanthanides"
            :key="element.id"
            :style="{ gridColumn: index + 3 }"
            role="listitem"
          >
            <ElementTile v-bind="tileProps(element)" />
          </div>
        </div>
      </div>

      <div v-if="actinides.length" id="aktinida" class="scroll-mt-24">
        <p class="mb-1 ml-0.5 text-[9px] font-bold tracking-[.12em] text-[#7c2d12] uppercase">
          Aktinida
        </p>
        <div class="grid gap-1" :style="fBlockGridStyle" role="list" aria-label="Deret aktinida">
          <div
            v-for="(element, index) in actinides"
            :key="element.id"
            :style="{ gridColumn: index + 3 }"
            role="listitem"
          >
            <ElementTile v-bind="tileProps(element)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
