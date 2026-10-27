<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import {
  createUser,
  deleteUser,
  getUsersPage,
  resetUserPassword,
  updateUser,
} from '../services/api.js'
import { useAuth } from '../composables/useAuth.js'

const auth = useAuth()
const currentUser = computed(() => auth.user.value)

const ROLES = [
  { value: 'user', label: 'Pengguna' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

const users = ref([])
const loading = ref(false)
const error = ref('')
const notice = ref('')

const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const limit = 10

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// Modal state
const showModal = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const formError = ref('')
const editingId = ref(null)
const form = ref({ name: '', email: '', password: '', role: 'user' })

const showPasswordModal = ref(false)
const passwordTarget = ref(null)
const newPassword = ref('')
const passwordError = ref('')

const showDeleteModal = ref(false)
const deleteTarget = ref(null)

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLoginAt', label: 'Login terakhir' },
  { key: 'actions', label: 'Aksi' },
]

const isEmpty = computed(() => !loading.value && users.value.length === 0)

function roleLabel(role) {
  return ROLES.find((item) => item.value === role)?.label ?? role
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const payload = await getUsersPage({
      page: page.value,
      limit,
      search: search.value,
      role: roleFilter.value,
      isActive: statusFilter.value,
    })
    users.value = payload.data ?? []
    total.value = payload.pagination?.total ?? users.value.length
    totalPages.value = payload.pagination?.totalPages ?? 1
  } catch (loadError) {
    error.value = loadError.message ?? 'Daftar pengguna tidak dapat dimuat.'
  } finally {
    loading.value = false
  }
}

let searchTimer = null
watch([search, roleFilter, statusFilter], () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})

watch(page, load)

onMounted(load)

function openCreate() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = { name: '', email: '', password: '', role: 'user' }
  formError.value = ''
  showModal.value = true
}

function openEdit(user) {
  modalMode.value = 'edit'
  editingId.value = user.id
  form.value = { name: user.name, email: user.email, password: '', role: user.role }
  formError.value = ''
  showModal.value = true
}

async function submitForm() {
  formError.value = ''
  saving.value = true
  try {
    if (modalMode.value === 'create') {
      if (form.value.password.length < 8) {
        formError.value = 'Password minimal 8 karakter'
        return
      }
      await createUser({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
      })
      notice.value = 'Pengguna baru berhasil dibuat.'
    } else {
      await updateUser(editingId.value, {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
      })
      notice.value = 'Data pengguna diperbarui.'
    }
    showModal.value = false
    await load()
  } catch (submitError) {
    formError.value = submitError.message ?? 'Gagal menyimpan pengguna.'
  } finally {
    saving.value = false
  }
}

async function toggleActive(user) {
  notice.value = ''
  error.value = ''
  try {
    await updateUser(user.id, { isActive: !user.isActive })
    notice.value = user.isActive
      ? `Akun ${user.email} dinonaktifkan.`
      : `Akun ${user.email} diaktifkan kembali.`
    await load()
  } catch (toggleError) {
    error.value = toggleError.message ?? 'Status akun gagal diubah.'
  }
}

function openPasswordModal(user) {
  passwordTarget.value = user
  newPassword.value = ''
  passwordError.value = ''
  showPasswordModal.value = true
}

async function submitPassword() {
  passwordError.value = ''
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password minimal 8 karakter'
    return
  }
  saving.value = true
  try {
    await resetUserPassword(passwordTarget.value.id, newPassword.value)
    showPasswordModal.value = false
    notice.value = `Password ${passwordTarget.value.email} berhasil diatur ulang.`
  } catch (resetError) {
    passwordError.value = resetError.message ?? 'Gagal mengatur ulang password.'
  } finally {
    saving.value = false
  }
}

function openDeleteModal(user) {
  deleteTarget.value = user
  showDeleteModal.value = true
}

async function confirmDelete() {
  saving.value = true
  try {
    await deleteUser(deleteTarget.value.id)
    showDeleteModal.value = false
    notice.value = `Pengguna ${deleteTarget.value.email} dihapus.`
    await load()
  } catch (deleteError) {
    error.value = deleteError.message ?? 'Gagal menghapus pengguna.'
  } finally {
    saving.value = false
  }
}

function isSelf(user) {
  return user.id === currentUser.value?.id
}
</script>

<template>
  <div class="shell py-8">
    <nav class="mb-6 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/admin"
        >Panel admin</RouterLink
      >
      <span class="mx-2">/</span><span class="text-ink">Pengguna</span>
    </nav>

    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="m-0 font-display text-2xl font-extrabold tracking-[-.04em] text-ink">
          Manajemen pengguna
        </h1>
        <p class="mt-1 mb-0 text-sm text-muted">
          {{ total }} akun terdaftar. Ubah role, nonaktifkan akun, atau atur ulang password.
        </p>
      </div>
      <button
        type="button"
        class="cursor-pointer rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-ink"
        @click="openCreate"
      >
        + Tambah pengguna
      </button>
    </header>

    <div
      v-if="notice"
      class="mb-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]"
      role="status"
    >
      {{ notice }}
    </div>
    <div
      v-if="error"
      class="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]"
      role="alert"
    >
      {{ error }}
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <label class="relative block">
        <span class="sr-only">Cari pengguna</span>
        <input
          v-model="search"
          type="search"
          placeholder="Cari nama atau email…"
          class="w-64 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
        />
      </label>
      <label class="block">
        <span class="sr-only">Filter role</span>
        <select
          v-model="roleFilter"
          class="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
        >
          <option value="">Semua role</option>
          <option v-for="role in ROLES" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </label>
      <label class="block">
        <span class="sr-only">Filter status</span>
        <select
          v-model="statusFilter"
          class="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
        >
          <option value="">Semua status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
      </label>
    </div>

    <div class="overflow-hidden rounded-card border border-line bg-white">
      <div v-if="loading" class="p-8 text-center text-sm text-muted" aria-busy="true">
        Memuat pengguna…
      </div>

      <div v-else-if="isEmpty" class="p-10 text-center">
        <p class="m-0 font-display text-lg font-bold text-ink">Tidak ada pengguna yang cocok.</p>
        <p class="mt-2 mb-0 text-sm text-muted">Coba ubah kata kunci atau filter.</p>
      </div>

      <table v-else class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-line bg-paper text-left">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-[.68rem] font-bold tracking-[.1em] text-muted uppercase"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in users" :key="item.id" class="border-b border-line/60 last:border-0">
            <td class="px-4 py-3 font-semibold text-ink">
              {{ item.name }}
              <span
                v-if="isSelf(item)"
                class="ml-2 rounded-full bg-navy/8 px-2 py-0.5 text-[.6rem] font-bold text-navy uppercase"
                >Anda</span
              >
            </td>
            <td class="px-4 py-3 text-muted">{{ item.email }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-[.06em]"
                :class="
                  item.role === 'admin'
                    ? 'bg-navy text-white'
                    : item.role === 'editor'
                      ? 'bg-[#eef6ff] text-navy'
                      : 'bg-paper text-muted'
                "
              >
                {{ roleLabel(item.role) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-[.06em]"
                :class="
                  item.isActive ? 'bg-[#f0fdf4] text-[#166534]' : 'bg-[#fef2f2] text-[#991b1b]'
                "
              >
                {{ item.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-muted">{{ formatDate(item.lastLoginAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="cursor-pointer text-xs font-bold text-navy hover:underline"
                  @click="openEdit(item)"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  class="cursor-pointer text-xs font-bold text-navy hover:underline"
                  @click="openPasswordModal(item)"
                >
                  Password
                </button>
                <button
                  type="button"
                  class="cursor-pointer text-xs font-bold hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                  :class="item.isActive ? 'text-[#b45309]' : 'text-[#166534]'"
                  :disabled="isSelf(item)"
                  @click="toggleActive(item)"
                >
                  {{ item.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
                <button
                  type="button"
                  class="cursor-pointer text-xs font-bold text-[#991b1b] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="isSelf(item)"
                  @click="openDeleteModal(item)"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between text-sm">
      <p class="m-0 text-muted">Halaman {{ page }} dari {{ totalPages }}</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 font-bold text-ink disabled:opacity-40"
          :disabled="page <= 1"
          @click="page -= 1"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 font-bold text-ink disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="page += 1"
        >
          Berikutnya
        </button>
      </div>
    </div>

    <!-- Modal tambah/ubah -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 cursor-default bg-navy/40 backdrop-blur-sm"
          aria-label="Tutup"
          @click="showModal = false"
        ></button>
        <div
          class="relative w-full max-w-md rounded-card bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <h2 class="m-0 font-display text-xl font-bold text-ink">
            {{ modalMode === 'create' ? 'Tambah pengguna' : 'Ubah pengguna' }}
          </h2>

          <form class="mt-5 space-y-4" @submit.prevent="submitForm">
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">Nama</span>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">Email</span>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <label v-if="modalMode === 'create'" class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted"
                >Password (min. 8 karakter)</span
              >
              <input
                v-model="form.password"
                type="password"
                required
                minlength="8"
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">Role</span>
              <select
                v-model="form.role"
                class="w-full cursor-pointer rounded-xl border border-line px-3 py-2.5 text-sm"
              >
                <option v-for="role in ROLES" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
            </label>

            <p
              v-if="formError"
              class="m-0 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]"
            >
              {{ formError }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                class="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink"
                @click="showModal = false"
              >
                Batal
              </button>
              <button
                type="submit"
                class="cursor-pointer rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                :disabled="saving"
              >
                {{ saving ? 'Menyimpan…' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal password -->
    <Teleport to="body">
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 cursor-default bg-navy/40 backdrop-blur-sm"
          aria-label="Tutup"
          @click="showPasswordModal = false"
        ></button>
        <div
          class="relative w-full max-w-sm rounded-card bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <h2 class="m-0 font-display text-xl font-bold text-ink">Atur ulang password</h2>
          <p class="mt-1 mb-0 text-sm text-muted">{{ passwordTarget?.email }}</p>
          <p class="mt-3 mb-0 rounded-lg bg-[#fff7ed] px-3 py-2 text-xs text-[#7c2d12]">
            Semua sesi aktif pengguna ini akan diputus setelah password diubah.
          </p>

          <form class="mt-4 space-y-4" @submit.prevent="submitPassword">
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-muted">Password baru</span>
              <input
                v-model="newPassword"
                type="password"
                required
                minlength="8"
                class="w-full rounded-xl border border-line px-3 py-2.5 text-sm"
              />
            </label>
            <p
              v-if="passwordError"
              class="m-0 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]"
            >
              {{ passwordError }}
            </p>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink"
                @click="showPasswordModal = false"
              >
                Batal
              </button>
              <button
                type="submit"
                class="cursor-pointer rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                :disabled="saving"
              >
                {{ saving ? 'Menyimpan…' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal hapus -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 cursor-default bg-navy/40 backdrop-blur-sm"
          aria-label="Tutup"
          @click="showDeleteModal = false"
        ></button>
        <div
          class="relative w-full max-w-sm rounded-card bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <h2 class="m-0 font-display text-xl font-bold text-ink">Hapus pengguna?</h2>
          <p class="mt-2 mb-0 text-sm text-muted">
            Akun <span class="font-bold text-ink">{{ deleteTarget?.email }}</span> akan dihapus
            permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink"
              @click="showDeleteModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-xl bg-[#991b1b] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              :disabled="saving"
              @click="confirmDelete"
            >
              {{ saving ? 'Menghapus…' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
