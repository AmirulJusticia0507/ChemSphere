<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth.js'

const auth = useAuth()
const route = useRoute()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const error = ref('')

const loading = computed(() => auth.loading)

async function handleSubmit() {
  error.value = null
  try {
    const data = await auth.signIn(form)
    const redirect = route.query.redirect
    router.push(redirect || (data.user?.role === 'admin' ? '/admin' : '/'))
  } catch (submitError) {
    error.value = submitError.message
  }
}
</script>

<template>
  <div class="shell flex min-h-[calc(100vh-220px)] items-center justify-center py-14">
    <div class="w-full max-w-md rounded-card border border-line bg-white p-7 shadow-[0_18px_55px_#17213d0d]">
      <div class="mb-6 text-center">
        <span class="mr-1 text-coral">◉</span>
        <span class="font-display text-xl font-bold tracking-[-.05em] text-ink">ChemSphere</span>
      </div>
      <h1 class="mb-1 text-center font-display text-2xl font-bold tracking-[-.04em] text-ink">
        Masuk
      </h1>
      <p class="mt-0 mb-6 text-center text-sm text-muted">
        Gunakan akun admin untuk mengelola data unsur dan ion.
      </p>

      <p
        v-if="route.query.registered"
        class="mb-4 rounded-xl bg-[#dcfce7] px-4 py-3 text-sm text-[#166534]"
      >
        Pendaftaran berhasil. Silakan masuk.
      </p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="login-email" class="mb-1 block text-sm font-semibold text-ink">Email</label>
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          />
        </div>
        <div>
          <label for="login-password" class="mb-1 block text-sm font-semibold text-ink">
            Kata sandi
          </label>
          <input
            id="login-password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          />
        </div>

        <p v-if="error" class="m-0 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full cursor-pointer rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Memproses…' : 'Masuk' }}
        </button>
      </form>

      <p class="mt-6 mb-0 text-center text-sm text-muted">
        Belum punya akun?
        <RouterLink class="font-semibold text-navy hover:underline" to="/daftar">Daftar</RouterLink>
      </p>
    </div>
  </div>
</template>
