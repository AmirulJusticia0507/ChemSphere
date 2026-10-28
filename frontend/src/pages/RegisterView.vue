<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { register } from '../services/auth.js'
import { showError, showSuccess } from '../services/alert.js'

const router = useRouter()

const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true

  try {
    await register(form)
    router.push({ name: 'login', query: { registered: '1' } })
    await showSuccess('Pendaftaran berhasil', 'Silakan masuk menggunakan akun baru Anda.')
  } catch (submitError) {
    error.value = submitError.message
    await showError(error.value, 'Pendaftaran gagal')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="shell flex min-h-[calc(100vh-220px)] items-center justify-center py-14">
    <div
      class="w-full max-w-md rounded-card border border-line bg-white p-7 shadow-[0_18px_55px_#17213d0d]"
    >
      <div class="mb-6 text-center">
        <span class="mr-1 text-coral" aria-hidden="true">◉</span>
        <span class="font-display text-xl font-extrabold tracking-[-.04em] text-ink"
          >ChemSphere</span
        >
      </div>
      <p class="label mb-2 text-center text-muted">
        <span class="text-coral-ink">[</span> Akun baru <span class="text-coral-ink">]</span>
      </p>
      <h1 class="mb-1 text-center font-display text-2xl font-extrabold tracking-[-.04em] text-ink">
        Daftar
      </h1>
      <p class="mt-0 mb-6 text-center text-sm text-muted">
        Buat akun untuk menyimpan progres belajarmu.
      </p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="register-name" class="label mb-1.5 block text-muted">Nama</label>
          <input
            id="register-name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            required
            class="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div>
          <label for="register-email" class="label mb-1.5 block text-muted">Email</label>
          <input
            id="register-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div>
          <label for="register-password" class="label mb-1.5 block text-muted"> Kata sandi </label>
          <input
            id="register-password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
          />
          <p class="mt-1 mb-0 text-xs text-muted">Minimal 8 karakter.</p>
        </div>

        <p v-if="error" class="m-0 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full cursor-pointer rounded-full bg-navy px-5 py-3.5 font-mono text-[.72rem] font-medium tracking-[.14em] text-white uppercase transition-transform duration-200 hover:scale-[1.01] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {{ loading ? 'Memproses…' : 'Buat akun' }}
        </button>
      </form>

      <p class="mt-6 mb-0 text-center text-sm text-muted">
        Sudah punya akun?
        <RouterLink class="font-semibold text-navy hover:underline" to="/masuk">Masuk</RouterLink>
      </p>
    </div>
  </div>
</template>
