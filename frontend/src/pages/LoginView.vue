<template>
  <div class="min-h-screen flex items-center justify-center bg-paper px-4">
    <div class="max-w-md w-full rounded-card border border-line p-6 shadow-[0_18px_55px_#17213d0d]">
      <div class="text-center mb-6">
        <span class="mr-1 text-coral">◉</span>
        <span class="font-display text-xl font-bold text-ink tracking-[-.05em]">ChemSphere</span>
      </div>
      <h2 class="mb-6 text-center font-display text-lg font-bold text-ink">Masuk</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-muted mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border border-line rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-muted mb-1">Kata sandi</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full border border-line rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none"
          />
        </div>
        <p v-if="error" class="text-sm text-coral">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-navy text-white font-bold py-2 rounded-xl hover:bg-opacity-90 disabled:opacity-60"
        >
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        Belum punya akun?
        <router-link to="/register" class="text-navy font-semibold hover:underline">Daftar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth.js'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()
const form = { email: '', password: '' }
const error = ref(null)
const loading = computed(() => auth.loading)

async function handleSubmit() {
  error.value = null
  try {
    await auth.signIn(form)
    await auth.fetchMe()
    router.push('/admin')
  } catch (e) {
    error.value = e.message
  }
}
</script>
