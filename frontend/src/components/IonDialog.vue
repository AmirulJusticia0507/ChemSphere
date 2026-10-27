<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { infoForIon } from '../data/ionInfo.js'

const props = defineProps({
  ion: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const closeButton = ref(null)
const info = computed(() => infoForIon(props.ion.formula))

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
  nextTick(() => closeButton.value?.focus())
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-navy/45 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-card bg-white shadow-[0_30px_80px_#17213d40]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`ion-${ion.id}-title`"
      >
        <div class="bg-navy px-7 py-6 text-white">
          <p class="m-0 text-[.68rem] font-bold tracking-[.15em] text-white/60 uppercase">
            Ion poliatomik
          </p>
          <div class="mt-2 flex items-end justify-between gap-4">
            <h2
              :id="`ion-${ion.id}-title`"
              class="m-0 font-display text-2xl font-bold tracking-[-.04em]"
            >
              {{ ion.name }}
            </h2>
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-bold whitespace-nowrap">
              Muatan {{ ion.charge }}
            </span>
          </div>
          <p class="mt-3 mb-0 font-display text-4xl font-bold text-[#f0d56e]">{{ ion.formula }}</p>
        </div>

        <div class="space-y-5 px-7 py-6">
          <div>
            <h3
              class="mt-0 mb-1.5 text-[.7rem] font-bold tracking-[.13em] text-coral-ink uppercase"
            >
              Tentang ion ini
            </h3>
            <p class="m-0 text-sm leading-relaxed text-[#39455e]">
              {{
                ion.description ??
                info?.description ??
                `Ion poliatomik ${ion.name} memiliki rumus ${ion.formula} dengan muatan ${ion.charge}. Ion ini terbentuk dari sekelompok atom yang terikat secara kovalen dan bermuatan total.`
              }}
            </p>
          </div>

          <div v-if="info?.example">
            <h3
              class="mt-0 mb-1.5 text-[.7rem] font-bold tracking-[.13em] text-coral-ink uppercase"
            >
              Contoh senyawa
            </h3>
            <p class="m-0 text-sm text-[#39455e]">{{ info.example }}</p>
          </div>

          <button
            ref="closeButton"
            type="button"
            class="w-full cursor-pointer rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
            @click="emit('close')"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
