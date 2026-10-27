<template>
  <div class="min-h-screen bg-paper">
    <div class="shell py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl font-bold text-ink">Panel Admin</h1>
          <p class="text-muted text-sm">Kelola konten unsur, kategori, dan ion poliatomik.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">
            {{ user?.name }} ({{ user?.role }})
          </span>
          <button
            @click="auth.signOut"
            class="text-sm font-semibold text-coral-ink hover:underline"
          >
            Keluar
          </button>
        </div>
      </div>

      <div class="flex gap-2 mb-4 border-b border-line pb-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
            activeTab === tab
              ? 'bg-navy text-white'
              : 'text-muted hover:bg-white/50',
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- ELEMEN -->
      <section v-if="activeTab === 'Kelola Unsur'" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-bold text-ink">Data Unsur</h2>
          <button
            @click="openElementForm()"
            class="bg-navy text-white text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-opacity-90"
          >
            + Tambah unsur
          </button>
        </div>
        <div class="rounded-xl border border-line overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/50 text-muted">
              <tr>
                <th class="px-4 py-3">No. Atom</th>
                <th class="px-4 py-3">Simbol</th>
                <th class="px-4 py-3">Nama (ID)</th>
                <th class="px-4 py-3">Kategori</th>
                <th class="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="el in elements" :key="el.id" class="bg-white hover:bg-orange-50/30 transition-colors">
                <td class="px-4 py-3 font-semibold">{{ el.atomicNumber }}</td>
                <td class="px-4 py-3">{{ el.symbol }}</td>
                <td class="px-4 py-3">{{ el.nameId }}</td>
                <td class="px-4 py-3">{{ el.category?.name ?? '—' }}</td>
                <td class="px-4 py-3 flex gap-2">
                  <button
                    @click="openElementForm(el)"
                    class="text-xs text-navy font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                  <button
                    @click="deleteElement(el.id)"
                    class="text-xs text-coral-ink font-semibold hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
              <tr v-if="elements.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-muted">Tidak ada data unsur.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- KATEGORI -->
      <section v-else-if="activeTab === 'Kelola Kategori'" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-bold text-ink">Kategori Unsur</h2>
          <button
            @click="openCategoryForm()"
            class="bg-navy text-white text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-opacity-90"
          >
            + Tambah kategori
          </button>
        </div>
        <div class="rounded-xl border border-line overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/50 text-muted">
              <tr>
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Jumlah unsur</th>
                <th class="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="cat in categories" :key="cat.id" class="bg-white hover:bg-blue-50/30 transition-colors">
                <td class="px-4 py-3 font-semibold">{{ cat.name }}</td>
                <td class="px-4 py-3">{{ cat._count?.elements ?? 0 }}</td>
                <td class="px-4 py-3 flex gap-2">
                  <button
                    @click="openCategoryForm(cat)"
                    class="text-xs text-navy font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                  <button
                    @click="deleteCategory(cat.id)"
                    class="text-xs text-coral-ink font-semibold hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                <td colspan="3" class="px-4 py-8 text-center text-muted">Tidak ada data kategori.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ION -->
      <section v-else>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-bold text-ink">Ion Poliatomik</h2>
          <button
            @click="openIonForm()"
            class="bg-navy text-white text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-opacity-90"
          >
            + Tambah ion
          </button>
        </div>
        <div class="rounded-xl border border-line overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/50 text-muted">
              <tr>
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Rumus</th>
                <th class="px-4 py-3">Muatan</th>
                <th class="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="ion in ions" :key="ion.id" class="bg-white hover:bg-green-50/30 transition-colors">
                <td class="px-4 py-3 font-semibold">{{ ion.name }}</td>
                <td class="px-4 py-3">{{ ion.formula }}</td>
                <td class="px-4 py-3">{{ ion.charge }}</td>
                <td class="px-4 py-3 flex gap-2">
                  <button
                    @click="openIonForm(ion)"
                    class="text-xs text-navy font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                  <button
                    @click="deleteIon(ion.id)"
                    class="text-xs text-coral-ink font-semibold hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
              <tr v-if="ions.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-muted">Tidak ada data ion.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FORM MODAL -->
      <div v-if="showModal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" @click="closeModal">
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl border border-line p-6 shadow-xl"
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
                @click="closeModal"
                class="text-sm font-semibold text-muted hover:text-ink"
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
import { ref, computed, onMounted } from 'vue'
import {
  getElements, createElement, updateElement, deleteElement as deleteElementApi,
  getCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi,
  getIons, createIon, updateIon, deleteIon as deleteIonApi,
} from '@/services/api.js'
import { useAuth } from '@/composables/useAuth.js'

const auth = useAuth()
const user = computed(() => auth.user)

const tabs = ['Kelola Unsur', 'Kelola Kategori', 'Ion Poliatomik']
const activeTab = ref('Kelola Unsur')

const elements = ref([])
const categories = ref([])
const ions = ref([])

// Modal state
const showModal = ref(false)
const modalTitle = ref('')
const saving = ref(false)
const editingElement = ref(null)
const editingCategory = ref(null)
const editingIon = ref(null)

const formData = ref({
  nameId: '', symbol: '', nameLatin: '', atomicMass: '', electronConfig: '',
  atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '',
  categoryId: '', name: '', formula: '', charge: '',
})

onMounted(loadData)

async function loadData() {
  elements.value = await getElements()
  categories.value = await getCategories()
  ions.value = await getIons()
}

// ---------- ELEMENT ----------
function openElementForm(el = null) {
  editingElement.value = el
  modalTitle.value = el ? 'Ubah Unsur' : 'Tambah Unsur'
  formData.value = el
    ? {
        nameId: el.nameId, symbol: el.symbol, nameLatin: el.nameLatin,
        atomicMass: el.atomicMass, electronConfig: el.electronConfig,
        atomicNumber: el.atomicNumber, period: el.period, group: el.group,
        description: el.description, uses: el.uses, hazardWarning: el.hazardWarning,
        categoryId: el.categoryId, name: '', formula: '', charge: '',
      }
    : { nameId: '', symbol: '', nameLatin: '', atomicMass: '', electronConfig: '',
        atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '',
        categoryId: '', name: '', formula: '', charge: '' }
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
  formData.value = cat ? { name: cat.name, symbol: '', nameLatin: '', atomicMass: '', electronConfig: '',
    atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '',
    categoryId: '', name: '', formula: '', charge: '' }
    : { name: '', symbol: '', nameLatin: '', atomicMass: '', electronConfig: '',
        atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '',
        categoryId: '', name: '', formula: '', charge: '' }
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
  formData.value = ion
    ? { name: ion.name, formula: ion.formula, charge: ion.charge, nameId: '', symbol: '', nameLatin: '', atomicMass: '', electronConfig: '', atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '', categoryId: '' }
    : { name: '', formula: '', charge: '', nameId: '', symbol: '', nameLatin: '', atomicMass: '', electronConfig: '', atomicNumber: '', period: '', group: '', description: '', uses: '', hazardWarning: '', categoryId: '' }
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
