<template>
  <section id="tabel" class="pt-[112px] pb-[70px] max-md:pt-[75px]">
    <div class="mb-[27px] flex items-end justify-between gap-[25px] max-md:items-start">
      <div>
        <p class="mt-0 mb-[13px] text-[.7rem] font-bold tracking-[.14em] text-coral-ink uppercase">
          Referensi visual
        </p>
        <h2 class="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-.055em]">
          Tabel periodik
        </h2>
      </div>
      <button
        class="cursor-pointer rounded-[11px] border border-line bg-white px-[14px] py-[11px] font-sans text-[.83rem] font-semibold text-ink"
        type="button"
      >
        Semua kategori <span class="pl-[18px]">⌄</span>
      </button>
    </div>

    <div
      class="overflow-auto rounded-card border border-[#e8ecf3] bg-white p-[clamp(16px,3vw,40px)] shadow-[0_18px_55px_#17213d0d]"
    >
      <img
        class="block h-auto w-full min-w-[690px]"
        src="/assets/periodic-table-polyatomic-id.svg"
        alt="Tabel periodik unsur dan ion poliatomik dalam Bahasa Indonesia"
      />
    </div>
  </section>
</template>
