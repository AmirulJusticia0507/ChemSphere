<template>
  <div class="shell py-28 text-center">
    <p class="m-0 text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">404</p>
    <h1 class="mt-3 mb-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold tracking-[-.055em]">
      Halaman tidak ditemukan.
    </h1>
    <p class="mx-auto mt-0 mb-8 max-w-md text-muted">
      Tautan yang kamu buka mungkin sudah berubah atau tidak pernah ada.
    </p>
    <RouterLink
      class="rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white no-underline"
      to="/tabel"
    >
      Kembali ke tabel periodik
    </RouterLink>
  </div>
</template>
