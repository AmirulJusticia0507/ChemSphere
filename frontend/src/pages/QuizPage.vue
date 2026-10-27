<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { getQuizAttempts, startQuiz, submitQuiz } from '../services/api.js'
import { useAuth } from '../composables/useAuth.js'

const auth = useAuth()

const TOPICS = [
  { id: 'campuran', label: 'Campuran', hint: 'Semua jenis soal' },
  { id: 'simbol', label: 'Simbol unsur', hint: 'Nama → simbol' },
  { id: 'nomor-atom', label: 'Nomor atom', hint: 'Nomor atom unsur' },
  { id: 'kategori', label: 'Kategori', hint: 'Logam, nonlogam, dll' },
  { id: 'golongan-periode', label: 'Golongan & periode', hint: 'Posisi di tabel' },
]

const stage = ref('setup') // setup | playing | result
const topic = ref('campuran')
const questionCount = ref(10)

const quiz = ref(null)
const answers = ref([])
const currentIndex = ref(0)
const loading = ref(false)
const error = ref('')
const result = ref(null)
const attempts = ref([])

let startedAt = 0
let timerId = null
const elapsed = ref(0)

const currentQuestion = computed(() => quiz.value?.questions?.[currentIndex.value] ?? null)
const progressPercent = computed(() => {
  if (!quiz.value?.questions?.length) return 0
  return Math.round(((currentIndex.value + 1) / quiz.value.questions.length) * 100)
})
const answeredCount = computed(() => answers.value.filter((answer) => answer !== null).length)
const canSubmit = computed(() => answeredCount.value === (quiz.value?.questions?.length ?? 0))

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function loadAttempts() {
  if (!auth.isAuthenticated.value) return
  try {
    attempts.value = await getQuizAttempts(10)
  } catch {
    attempts.value = []
  }
}

async function begin() {
  loading.value = true
  error.value = ''
  try {
    const data = await startQuiz(topic.value, questionCount.value)
    quiz.value = data
    answers.value = new Array(data.questions.length).fill(null)
    currentIndex.value = 0
    stage.value = 'playing'
    startedAt = Date.now()
    elapsed.value = 0
    timerId = setInterval(() => {
      elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
    }, 1000)
  } catch (startError) {
    error.value = startError.message ?? 'Kuis tidak dapat dimulai.'
  } finally {
    loading.value = false
  }
}

function choose(option) {
  answers.value[currentIndex.value] = option
  // Beri jeda singkat agar pilihan terlihat sebelum pindah soal.
  setTimeout(() => {
    if (currentIndex.value < quiz.value.questions.length - 1) {
      currentIndex.value += 1
    }
  }, 220)
}

function goTo(index) {
  currentIndex.value = index
}

async function finish() {
  loading.value = true
  error.value = ''
  try {
    const durationSec = Math.floor((Date.now() - startedAt) / 1000)
    result.value = await submitQuiz(quiz.value.quizId, answers.value, durationSec)
    stage.value = 'result'
    clearInterval(timerId)
    await loadAttempts()
  } catch (submitError) {
    error.value = submitError.message ?? 'Jawaban tidak dapat dikirim.'
  } finally {
    loading.value = false
  }
}

function restart() {
  stage.value = 'setup'
  quiz.value = null
  result.value = null
  answers.value = []
  currentIndex.value = 0
  elapsed.value = 0
  clearInterval(timerId)
}

function scoreTone(score) {
  if (score >= 80) return 'text-[#166534]'
  if (score >= 60) return 'text-[#b45309]'
  return 'text-[#991b1b]'
}

onMounted(loadAttempts)
onUnmounted(() => clearInterval(timerId))
</script>

<template>
  <div class="shell pt-10 pb-16">
    <nav class="mb-8 text-xs text-muted" aria-label="Breadcrumb">
      <RouterLink class="text-muted no-underline hover:text-ink" to="/">Beranda</RouterLink>
      <span class="mx-2">/</span><span class="text-ink">Latihan</span>
    </nav>

    <header class="relative isolate overflow-hidden rounded-card bg-navy px-6 py-10 text-white sm:px-10">
      <span class="absolute -top-20 -right-12 -z-10 h-60 w-60 rounded-full border border-white/10"></span>
      <p class="m-0 text-[.7rem] font-bold tracking-[.15em] text-[#f0d56e] uppercase">Latihan</p>
      <h1 class="mt-2 mb-0 max-w-2xl font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] font-bold tracking-[-.055em]">
        Kuis unsur kimia
      </h1>
      <p class="mt-4 mb-0 max-w-2xl text-sm leading-relaxed text-white/70">
        Soal dibangkitkan dari data unsur di aplikasi ini. Jawaban benar disimpan di server, jadi tidak bisa diintip dari browser.
      </p>
    </header>

    <div v-if="!auth.isAuthenticated.value" class="mt-8 rounded-card border border-line bg-white p-8 text-center">
      <p class="m-0 font-display text-xl font-bold text-ink">Masuk dulu untuk mengerjakan kuis</p>
      <p class="mt-2 mb-0 text-sm text-muted">Skor dan progres belajar disimpan ke akunmu.</p>
      <RouterLink to="/masuk" class="mt-5 inline-block rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white no-underline">
        Masuk
      </RouterLink>
    </div>

    <template v-else>
      <p v-if="error" class="mt-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]" role="alert">
        {{ error }}
      </p>

      <!-- Setup -->
      <section v-if="stage === 'setup'" class="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div class="rounded-card border border-line bg-white p-6">
          <h2 class="m-0 font-display text-xl font-bold tracking-[-.04em] text-ink">Pilih topik</h2>
          <div class="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              v-for="item in TOPICS"
              :key="item.id"
              type="button"
              class="cursor-pointer rounded-xl border px-4 py-3 text-left transition"
              :class="topic === item.id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink hover:border-navy/30'"
              :aria-pressed="topic === item.id"
              @click="topic = item.id"
            >
              <span class="block text-sm font-bold">{{ item.label }}</span>
              <span class="block text-[.68rem] font-semibold" :class="topic === item.id ? 'text-white/70' : 'text-muted'">
                {{ item.hint }}
              </span>
            </button>
          </div>

          <label class="mt-5 block">
            <span class="mb-2 block text-xs font-bold text-muted">Jumlah soal</span>
            <select v-model.number="questionCount" class="w-full cursor-pointer rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink">
              <option :value="5">5 soal</option>
              <option :value="10">10 soal</option>
              <option :value="20">20 soal</option>
            </select>
          </label>

          <button
            type="button"
            class="mt-5 w-full cursor-pointer rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-ink disabled:opacity-50"
            :disabled="loading"
            @click="begin"
          >
            {{ loading ? 'Menyiapkan soal…' : 'Mulai kuis' }}
          </button>
        </div>

        <div class="rounded-card border border-line bg-white p-6">
          <h2 class="m-0 font-display text-lg font-bold tracking-[-.04em] text-ink">Riwayat terakhir</h2>
          <p v-if="!attempts.length" class="mt-3 mb-0 text-sm text-muted">Belum ada percobaan. Mulai kuis pertamamu.</p>
          <ul v-else class="mt-3 mb-0 list-none space-y-2 p-0">
            <li v-for="attempt in attempts" :key="attempt.id" class="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0">
              <div>
                <p class="m-0 text-sm font-semibold text-ink">{{ attempt.topic }}</p>
                <p class="m-0 text-xs text-muted">
                  {{ attempt.correct }}/{{ attempt.total }} benar ·
                  {{ new Date(attempt.createdAt).toLocaleDateString('id-ID') }}
                </p>
              </div>
              <span class="font-display text-lg font-bold" :class="scoreTone(attempt.score)">{{ attempt.score }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Playing -->
      <section v-else-if="stage === 'playing' && currentQuestion" class="mt-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="m-0 text-sm font-semibold text-muted">
            Soal {{ currentIndex + 1 }} dari {{ quiz.questions.length }}
          </p>
          <p class="m-0 text-sm font-semibold text-muted">Waktu {{ formatDuration(elapsed) }}</p>
        </div>

        <div class="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div class="h-full rounded-full bg-navy transition-all" :style="{ width: `${progressPercent}%` }"></div>
        </div>

        <div class="mt-6 rounded-card border border-line bg-white p-6 sm:p-8">
          <p class="m-0 font-display text-xl leading-snug font-bold tracking-[-.03em] text-ink sm:text-2xl">
            {{ currentQuestion.question }}
          </p>

          <div class="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              v-for="option in currentQuestion.options"
              :key="option"
              type="button"
              class="cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-semibold transition"
              :class="answers[currentIndex] === option ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink hover:border-navy/30 hover:bg-paper'"
              :aria-pressed="answers[currentIndex] === option"
              @click="choose(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="(answer, index) in answers"
              :key="index"
              type="button"
              class="h-8 w-8 cursor-pointer rounded-lg text-xs font-bold transition"
              :class="[
                index === currentIndex ? 'bg-navy text-white' : answer !== null ? 'bg-[#eef6ff] text-navy' : 'bg-white text-muted border border-line',
              ]"
              :aria-label="`Ke soal ${index + 1}`"
              @click="goTo(index)"
            >
              {{ index + 1 }}
            </button>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              class="cursor-pointer rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold text-ink disabled:opacity-40"
              :disabled="currentIndex === 0"
              @click="currentIndex -= 1"
            >
              Sebelumnya
            </button>
            <button
              v-if="currentIndex < quiz.questions.length - 1"
              type="button"
              class="cursor-pointer rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white"
              @click="currentIndex += 1"
            >
              Berikutnya
            </button>
            <button
              v-else
              type="button"
              class="cursor-pointer rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              :disabled="!canSubmit || loading"
              @click="finish"
            >
              {{ loading ? 'Mengirim…' : 'Selesai' }}
            </button>
          </div>
        </div>

        <p v-if="!canSubmit" class="mt-3 mb-0 text-xs text-muted">
          {{ answeredCount }}/{{ quiz.questions.length }} soal terjawab. Jawab semua untuk menyelesaikan.
        </p>
      </section>

      <!-- Result -->
      <section v-else-if="stage === 'result' && result" class="mt-8">
        <div class="rounded-card border border-navy/10 bg-[linear-gradient(135deg,#eef6ff_0%,#fff8f4_100%)] p-8 text-center">
          <p class="m-0 text-[.68rem] font-bold tracking-[.12em] text-coral-ink uppercase">Hasil kuis</p>
          <p class="mt-3 mb-0 font-display text-[clamp(3rem,10vw,5rem)] leading-none font-bold tracking-[-.06em]" :class="scoreTone(result.score)">
            {{ result.score }}
          </p>
          <p class="mt-2 mb-0 text-sm font-semibold text-muted">
            {{ result.correct }} dari {{ result.total }} soal benar
          </p>
          <button
            type="button"
            class="mt-6 cursor-pointer rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white"
            @click="restart"
          >
            Kuis lagi
          </button>
        </div>

        <div class="mt-5 rounded-card border border-line bg-white p-6">
          <h2 class="m-0 font-display text-lg font-bold tracking-[-.04em] text-ink">Rincian jawaban</h2>
          <ul class="mt-4 mb-0 list-none space-y-2 p-0">
            <li
              v-for="item in result.results"
              :key="item.index"
              class="flex items-start gap-3 border-b border-line/60 pb-2 last:border-0"
            >
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="item.isCorrect ? 'bg-[#f0fdf4] text-[#166534]' : 'bg-[#fef2f2] text-[#991b1b]'"
              >
                {{ item.isCorrect ? '✓' : '✕' }}
              </span>
              <div class="min-w-0">
                <p class="m-0 text-sm font-semibold text-ink">{{ quiz.questions[item.index].question }}</p>
                <p class="m-0 text-xs text-muted">
                  Jawabanmu: <span class="font-semibold">{{ item.given ?? 'tidak dijawab' }}</span>
                  <span v-if="!item.isCorrect"> · Benar: <span class="font-semibold text-[#166534]">{{ item.correct }}</span></span>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </template>
  </div>
</template>
