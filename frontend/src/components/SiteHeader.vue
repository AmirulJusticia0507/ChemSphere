<template>
  <header
    class="shell flex h-[82px] items-center justify-between max-md:h-[70px]"
  >
    <a
      class="font-display text-[1.35rem] font-bold tracking-[-.05em] text-ink no-underline"
      href="#beranda"
      aria-label="ChemSphere beranda"
    >
      <span class="mr-[7px] text-coral">◉</span>ChemSphere
    </a>

    <nav class="flex gap-[30px] max-md:hidden" aria-label="Navigasi utama">
      <a class="text-[.93rem] font-semibold text-ink no-underline" href="#beranda">Beranda</a>
      <a class="text-[.93rem] font-semibold text-muted no-underline hover:text-ink" href="#tabel">
        Tabel periodik
      </a>
      <a class="text-[.93rem] font-semibold text-muted no-underline hover:text-ink" href="#eksplorasi">
        Eksplorasi
      </a>
    </nav>

    <button
      class="h-[38px] w-[38px] cursor-pointer rounded-full border-0 bg-navy font-bold text-white"
      type="button"
      aria-label="Buka profil"
    >
      AR
    </button>
  </header>
</template>
