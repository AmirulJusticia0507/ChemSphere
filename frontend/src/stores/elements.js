import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getElements, getElementsPage } from '../services/api.js'

// Cache data unsur di level aplikasi supaya berpindah halaman tidak
// memicu permintaan ulang. Data dianggap segar selama TTL.
const TTL_MS = 5 * 60 * 1000

export const useElementsStore = defineStore('elements', () => {
  const all = ref([])
  const loading = ref(false)
  const error = ref('')
  const fetchedAt = ref(0)

  const bySymbol = computed(() => {
    const map = {}
    for (const element of all.value) map[element.symbol] = element
    return map
  })

  const byId = computed(() => {
    const map = {}
    for (const element of all.value) map[element.id] = element
    return map
  })

  const massBySymbol = computed(() => {
    const map = {}
    for (const element of all.value) map[element.symbol] = Number(element.atomicMass)
    return map
  })

  function isFresh() {
    return all.value.length > 0 && Date.now() - fetchedAt.value < TTL_MS
  }

  // Memuat seluruh unsur sekali, lalu memakai cache sampai TTL habis.
  async function ensureLoaded({ force = false } = {}) {
    if (!force && isFresh()) return all.value
    if (loading.value) return all.value

    loading.value = true
    error.value = ''
    try {
      all.value = await getElements()
      fetchedAt.value = Date.now()
      return all.value
    } catch (loadError) {
      error.value = loadError.message ?? 'Data unsur tidak dapat dimuat.'
      return all.value
    } finally {
      loading.value = false
    }
  }

  // Halaman data dari server, untuk tabel dengan paginasi.
  async function fetchPage({ page = 1, limit = 24, search = '' } = {}) {
    loading.value = true
    error.value = ''
    try {
      const payload = await getElementsPage({ page, limit, search })
      return {
        data: payload.data ?? [],
        pagination: payload.pagination ?? null,
      }
    } catch (loadError) {
      error.value = loadError.message ?? 'Data unsur tidak dapat dimuat.'
      return { data: [], pagination: null }
    } finally {
      loading.value = false
    }
  }

  function invalidate() {
    fetchedAt.value = 0
  }

  return {
    all,
    loading,
    error,
    bySymbol,
    byId,
    massBySymbol,
    ensureLoaded,
    fetchPage,
    invalidate,
  }
})
