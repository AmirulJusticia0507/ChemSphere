<template>
  <div class="min-h-screen bg-paper">
    <div class="shell py-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-2xl font-extrabold tracking-[-.04em] text-ink">Panel Admin</h1>
          <p class="text-muted text-sm">Kelola konten unsur, kategori, dan ion poliatomik.</p>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink
            v-if="auth.user?.role === 'admin'"
            to="/admin/pengguna"
            class="rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-navy no-underline hover:border-navy/30"
          >
            Manajemen pengguna
          </RouterLink>
          <span class="label text-muted uppercase">
            {{ user?.name }} ({{ user?.role }})
          </span>
          <button
            type="button"
            class="label text-coral-ink hover:underline"
            @click="auth.signOut"
          >
            Keluar
          </button>
        </div>
      </div>

      <div class="flex gap-2 mb-4 border-b border-line pb-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          :class="activeTab === tab ? 'bg-navy text-white' : 'text-muted hover:bg-white/50'"
          @click="switchTab(tab)"
        >
          {{ tab }}
        </button>
      </div>

      <!-- ELEMEN -->
      <section v-if="activeTab === 'Kelola Unsur'" class="mb-10">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="font-display text-lg font-bold text-ink">Data Unsur</h2>
          <div class="flex flex-wrap items-center gap-3">
            <label class="relative block">
              <span class="sr-only">Cari unsur</span>
              <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">⌕</span>
              <input
                v-model="elementSearch"
                type="search"
                placeholder="Cari nama, simbol, nomor atom…"
                class="w-56 rounded-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
              />
            </label>
            <button
              type="button"
              class="bg-navy text-white text-sm font-bold px-3 py-2 rounded-lg hover:bg-opacity-90"
              @click="openElementForm()"
            >
              + Tambah unsur
            </button>
          </div>
        </div>

        <DataTable
          :columns="elementColumns"
          :rows="elements"
          :loading="loading"
          empty-text="Tidak ada data unsur."
        >
          <template #cell-category="{ row }">
            {{ row.category?.name ?? '—' }}
          </template>
          <template #cell-actions="{ row }">
            <div class="flex gap-3">
              <button
                type="button"
                class="text-xs text-navy font-semibold hover:underline"
                @click="openElementForm(row)"
              >
                Ubah
              </button>
              <button
                type="button"
                class="text-xs text-coral-ink font-semibold hover:underline"
                @click="deleteElement(row.id)"
              >
                Hapus
              </button>
            </div>
          </template>
        </DataTable>

        <Pagination
          :page="elementPage"
          :total-pages="elementTotalPages"
          :total="elementTotal"
          :limit="limit"
          @update:page="elementPage = $event"
        />
      </section>

      <!-- KATEGORI -->
      <section v-else-if="activeTab === 'Kelola Kategori'" class="mb-10">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="font-display text-lg font-bold text-ink">Kategori Unsur</h2>
          <div class="flex flex-wrap items-center gap-3">
            <label class="relative block">
              <span class="sr-only">Cari kategori</span>
              <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">⌕</span>
              <input
                v-model="categorySearch"
                type="search"
                placeholder="Cari kategori…"
                class="w-56 rounded-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
              />
            </label>
            <button
              type="button"
              class="bg-navy text-white text-sm font-bold px-3 py-2 rounded-lg hover:bg-opacity-90"
              @click="openCategoryForm()"
            >
              + Tambah kategori
            </button>
          </div>
        </div>

        <DataTable
          :columns="categoryColumns"
          :rows="categories"
          :loading="loading"
          empty-text="Tidak ada data kategori."
        >
          <template #cell-actions="{ row }">
            <div class="flex gap-3">
              <button
                type="button"
                class="text-xs text-navy font-semibold hover:underline"
                @click="openCategoryForm(row)"
              >
                Ubah
              </button>
              <button
                type="button"
                class="text-xs text-coral-ink font-semibold hover:underline"
                @click="deleteCategory(row.id)"
              >
                Hapus
              </button>
            </div>
          </template>
        </DataTable>

        <Pagination
          :page="categoryPage"
          :total-pages="categoryTotalPages"
          :total="categoryTotal"
          :limit="limit"
          @update:page="categoryPage = $event"
        />
      </section>

      <!-- ION -->
      <section v-else>
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="font-display text-lg font-bold text-ink">Ion Poliatomik</h2>
          <div class="flex flex-wrap items-center gap-3">
            <label class="relative block">
              <span class="sr-only">Cari ion</span>
              <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">⌕</span>
              <input
                v-model="ionSearch"
                type="search"
                placeholder="Cari nama atau rumus…"
                class="w-56 rounded-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
              />
            </label>
            <button
              type="button"
              class="bg-navy text-white text-sm font-bold px-3 py-2 rounded-lg hover:bg-opacity-90"
              @click="openIonForm()"
            >
              + Tambah ion
            </button>
          </div>
        </div>

        <DataTable
          :columns="ionColumns"
          :rows="ions"
          :loading="loading"
          empty-text="Tidak ada data ion."
        >
          <template #cell-actions="{ row }">
            <div class="flex gap-3">
              <button
                type="button"
                class="text-xs text-navy font-semibold hover:underline"
                @click="openIonForm(row)"
              >
                Ubah
              </button>
              <button
                type="button"
                class="text-xs text-coral-ink font-semibold hover:underline"
                @click="deleteIon(row.id)"
              >
                Hapus
              </button>
            </div>
          </template>
        </DataTable>

        <Pagination
          :page="ionPage"
          :total-pages="ionTotalPages"
          :total="ionTotal"
          :limit="limit"
          @update:page="ionPage = $event"
        />
      </section>

      <!-- FORM MODAL -->
      <div v-if="showModal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" @click="closeModal">
        <div
          class="absolute top-1/2 left-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-white p-6 shadow-xl"
          @click.stop
        >
          <h3 class="font-display text-lg font-bold text-ink mb-4">{{ modalTitle }}</h3>
          <form @submit.prevent="saveModal" class="space-y-3">
            <div v-if="editingElement || elementForm.mode === 'element'">
              <label class="block text-xs font-semibold text-muted">Nama (Indonesia)</label>
              <input
                v-model="formData.nameId"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Simbol</label>
              <input
                v-model="formData.symbol"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Nama Latin</label>
              <input
                v-model="formData.nameLatin"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">No. Atom</label>
              <input
                v-model="formData.atomicNumber"
                type="number"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Massa Atom</label>
              <input
                v-model="formData.atomicMass"
                type="number"
                step="0.0001"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Konfigurasi Elektron</label>
              <input
                v-model="formData.electronConfig"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Periode</label>
              <input
                v-model="formData.period"
                type="number"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Golongan</label>
              <input
                v-model="formData.group"
                type="number"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Deskripsi</label>
              <textarea
                v-model="formData.description"
                rows="2"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Kegunaan</label>
              <textarea
                v-model="formData.uses"
                rows="2"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Peringatan Bahaya</label>
              <textarea
                v-model="formData.hazardWarning"
                rows="2"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Kategori</label>
              <select
                v-model="formData.categoryId"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div v-else-if="editingCategory || categoryForm.mode === 'category'">
              <label class="block text-xs font-semibold text-muted">Nama kategori</label>
              <input
                v-model="formData.name"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
            </div>

            <div v-else>
              <label class="block text-xs font-semibold text-muted">Nama ion</label>
              <input
                v-model="formData.name"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Rumus</label>
              <input
                v-model="formData.formula"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
              <label class="block text-xs font-semibold text-muted mt-2">Muatan</label>
              <input
                v-model="formData.charge"
                class="w-full border border-line rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
              />
            </div>

            <div class="mt-6 flex justify-end gap-2">
              <button
                type="button"
                class="text-sm font-semibold text-muted hover:text-ink"
                @click="closeModal"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="bg-navy text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-60"
              >
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  getElementsPage, createElement, updateElement, deleteElement as deleteElementApi,
  getCategoriesPage, createCategory, updateCategory, deleteCategory as deleteCategoryApi,
  getIonsPage, createIon, updateIon, deleteIon as deleteIonApi,
} from '@/services/api.js'
import { useAuth } from '@/composables/useAuth.js'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'

const auth = useAuth()
const user = computed(() => auth.user)

const tabs = ['Kelola Unsur', 'Kelola Kategori', 'Ion Poliatomik']
const activeTab = ref('Kelola Unsur')
const limit = 10
const loading = ref(false)

const elementColumns = [
  { key: 'atomicNumber', label: 'No. Atom' },
  { key: 'symbol', label: 'Simbol' },
  { key: 'nameId', label: 'Nama (ID)' },
  { key: 'category', label: 'Kategori' },
  { key: 'actions', label: 'Aksi' },
]
const categoryColumns = [
  { key: 'name', label: 'Nama' },
  { key: 'elementCount', label: 'Jumlah unsur' },
  { key: 'actions', label: 'Aksi' },
]
const ionColumns = [
  { key: 'name', label: 'Nama' },
  { key: 'formula', label: 'Rumus' },
  { key: 'charge', label: 'Muatan' },
  { key: 'actions', label: 'Aksi' },
]

const elements = ref([])
const categories = ref([])
const ions = ref([])

const elementPage = ref(1)
const elementTotal = ref(0)
const elementTotalPages = ref(1)
const categoryPage = ref(1)
const categoryTotal = ref(0)
const categoryTotalPages = ref(1)
const ionPage = ref(1)
const ionTotal = ref(0)
const ionTotalPages = ref(1)

const elementSearch = ref('')
const categorySearch = ref('')
const ionSearch = ref('')

// Modal state
const showModal = ref(false)
const modalTitle = ref('')
const saving = ref(false)
const editingElement = ref(null)
const editingCategory = ref(null)
const editingIon = ref(null)

const blankForm = () => ({
  nameId: '', symbol: '', nameLatin: '', atomicMass: '', electronConfig: '',
  atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '',
  categoryId: '', name: '', formula: '', charge: '',
})

const formData = ref(blankForm())

onMounted(loadData)

let searchTimer = null
watch([elementSearch, categorySearch, ionSearch], () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    elementPage.value = 1
    categoryPage.value = 1
    ionPage.value = 1
    loadData()
  }, 300)
})

watch([elementPage, categoryPage, ionPage], loadData)

async function loadData() {
  loading.value = true
  try {
    const [elementRes, categoryRes, ionRes] = await Promise.all([
      getElementsPage({ page: elementPage.value, limit, search: elementSearch.value }),
      getCategoriesPage({ page: categoryPage.value, limit, search: categorySearch.value }),
      getIonsPage({ page: ionPage.value, limit, search: ionSearch.value }),
    ])

    const elementPaginated = Boolean(elementRes.pagination)
    elements.value = elementRes.data.map((el) => ({
      ...el,
      elementCount: el.category?._count?.elements ?? 0,
    }))
    elementTotal.value = elementPaginated ? elementRes.pagination.total : elementRes.data.length
    elementTotalPages.value = elementPaginated ? elementRes.pagination.totalPages : 1

    categories.value = categoryRes.data.map((cat) => ({
      ...cat,
      elementCount: cat._count?.elements ?? 0,
    }))
    categoryTotal.value = categoryRes.pagination
      ? categoryRes.pagination.total
      : categoryRes.data.length
    categoryTotalPages.value = categoryRes.pagination ? categoryRes.pagination.totalPages : 1

    ions.value = ionRes.data
    ionTotal.value = ionRes.pagination ? ionRes.pagination.total : ionRes.data.length
    ionTotalPages.value = ionRes.pagination ? ionRes.pagination.totalPages : 1
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

function switchTab(tab) {
  activeTab.value = tab
}

// ---------- ELEMENT ----------
function openElementForm(el = null) {
  editingElement.value = el
  modalTitle.value = el ? 'Ubah Unsur' : 'Tambah Unsur'
  formData.value = el
    ? { ...blankForm(), ...el }
    : blankForm()
  showModal.value = true
}

async function deleteElement(id) {
  if (!confirm('Hapus unsur ini?')) return
  try {
    await deleteElementApi(id)
    await loadData()
  } catch (e) {
    alert(e.message)
  }
}

// ---------- CATEGORY ----------
function openCategoryForm(cat = null) {
  editingCategory.value = cat
  modalTitle.value = cat ? 'Ubah Kategori' : 'Tambah Kategori'
  formData.value = cat ? { ...blankForm(), name: cat.name } : blankForm()
  showModal.value = true
}

async function deleteCategory(id) {
  if (!confirm('Hapus kategori ini?')) return
  try {
    await deleteCategoryApi(id)
    await loadData()
  } catch (e) {
    alert(e.message)
  }
}

// ---------- ION ----------
function openIonForm(ion = null) {
  editingIon.value = ion
  modalTitle.value = ion ? 'Ubah Ion' : 'Tambah Ion'
  formData.value = ion ? { ...blankForm(), ...ion } : blankForm()
  showModal.value = true
}

async function deleteIon(id) {
  if (!confirm('Hapus ion ini?')) return
  try {
    await deleteIonApi(id)
    await loadData()
  } catch (e) {
    alert(e.message)
  }
}

// ---------- SAVE ----------
async function saveModal() {
  saving.value = true
  try {
    if (editingElement.value) {
      await updateElement(editingElement.value.id, formData.value)
    } else if (activeTab.value === 'Kelola Unsur') {
      await createElement(formData.value)
    } else if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, formData.value)
    } else if (activeTab.value === 'Kelola Kategori') {
      await createCategory(formData.value)
    } else if (editingIon.value) {
      await updateIon(editingIon.value.id, formData.value)
    } else {
      await createIon(formData.value)
    }
    closeModal()
    await loadData()
  } catch (e) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

function closeModal() {
  showModal.value = false
  editingElement.value = null
  editingCategory.value = null
  editingIon.value = null
}
</script>
