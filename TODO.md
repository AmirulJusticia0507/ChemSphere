# TODO ChemSphere

## Fondasi

- [x] Siapkan aplikasi frontend Vue 3 dan Tailwind CSS.
- [x] Lengkapi API Express serta konfigurasi environment backend.
- [x] Buat skema dan migrasi PostgreSQL.

## Fitur utama

- [x] Tampilkan tabel periodik Bahasa Indonesia dari `docs/assets/periodic-table-polyatomic-id.svg`.
- [x] Tambahkan pencarian, filter kategori, golongan, dan periode unsur.
- [x] Buat halaman detail unsur: nomor atom, massa atom, konfigurasi elektron, sifat, kegunaan, dan peringatan bahaya.
- [x] Tampilkan detail ion poliatomik yang tersedia pada tabel.
- [x] Tambahkan autentikasi pengguna bila fitur memerlukan akun.

## Data dan administrasi

- [x] Siapkan data awal unsur, kategori, dan ion poliatomik.
- [x] Tambahkan panel admin untuk mengelola konten bila data perlu diperbarui melalui aplikasi.
- [x] Tambahkan peran pengguna dan otorisasi untuk fitur admin.

## Pengalaman pengguna

- [x] Buat tampilan responsif untuk desktop dan perangkat seluler.
- [x] Pastikan navigasi keyboard, kontras warna, dan teks alternatif aksesibel.
- [x] Tambahkan state loading, kosong, dan error pada halaman utama.

## Kualitas

- [x] Uji alur utama frontend dan API.
- [x] Validasi input, tangani error API, dan lindungi endpoint yang memerlukan autentikasi.
- [x] Tambahkan seed database untuk lingkungan pengembangan.
- [x] Dokumentasikan cara menjalankan aplikasi.
- [x] Siapkan konfigurasi deployment, environment produksi, dan backup database.

## Catatan Progres Terakhir (Desember 2026)

### Fitur tambahan setelah TODO.md dibuat

1. **SEO (Search Engine Optimization)**
   - Sitemap dinamis `/sitemap.xml` (halaman statis + 118 unsur via UUID).
   - `robots.txt` (disallow `/admin`, `/masuk`, `/daftar`, `/progres`, arahkan ke sitemap).
   - Meta tags dinamis di setiap halaman via `usePageMeta` composable: `title`, `description`, `og:*`, `twitter:*`.
   - JSON-LD `ChemicalSubstance` di halaman detail unsur untuk rich result pencarian kimia.
   - `index.html` memuat meta lengkap (description, keywords, autor, Open Graph, Twitter Card, JSON-LD `WebApplication` dengan `offers price: 0 IDR`).

2. **Paginasi Admin (Server-Side)**
   - Backend (`elementController`, `categoryController`, `ionController`) mendukung query `page` + `limit` → respons `{ data, pagination: { page, limit, total, totalPages } }`.
   - Frontend: komponen `DataTable.vue` (dinamis, kolom custom, slot cell) + `Pagination.vue` (navigasi `‹ 1 2 … 12 ›`, info "Menampilkan X–Y dari Y data").
   - Opt-in: kalau `page`/`limit` tidak dikirim, return array utuh (tidak memecah `TablePage`/`HomePage`).

3. **Theming Krem/Biru Editorial**
   - Gaya dari referensi andikadevs.space: latar krem `#fff9f1`, font **Bricolage Grotesque** (judul), **Space Grotesk** (body), **JetBrains Mono** (label uppercase).
   - Warna aksen: biru `#2b6cb0`, kuning `#ffda3f`, koral `#fc9073`.
   - Pill button hitam mono uppercase, label `[ Label ]`, hairline border warna `#e4dccb`.
   - Verifikasi lewat headless browser: 0 console error, tampilan desktop & mobile 390px rapi.

4. **Aksesibilitas Tingkat Lanjut**
   - Skip-to-content link (`Lewati ke konten utama`) + `id="konten-utama"`.
   - Focus ring global `:focus-visible` outline navy 3px, tanpa outline programatis.
   - Kontras: `--color-coral-ink` digelapkan `#df5c42 → #b8442f` (3.5:1 → ~5:1, lolos WCAG AA).
   - `text-coral` → `text-coral-ink` sebagai warna teks. `bg-coral` + teks navy tetap (6.4:1).
   - Titik `◉` dekoratif: `aria-hidden="true"` di 5 lokasi.
   - ElementTile: `RouterLink` dengan `aria-label` + `focus-visible`.

5. **Halaman Auth (Login/Register)**
   - Visual direstyle ke tema krem + pill hitam mono uppercase.
   - Eyebrow `[ AKUN PENGGUNA ]` / `[ AKUN BARU ]`.
   - Tombol `MASUK`/`BUAT AKUN` pakai state `submitting` lokal (bukan global loading dari auth store).
   - Login sukses kredensial: `admin@chemsphere.local` / `ChemSphere123!`.

Semua build `npm run build` sukses tanpa error. Semua fitur ini ter-commit ke `main` (commit terakhir `3c5b3750`).

### Belum Selesai (Infrastruktur & Verifikasi)

- [ ] **Perbaiki binding port backend** — `EADDRINUSE` di port 5000 disebabkan proses `node --watch` sebelumnya masih berjalan; perlu `kill` proses lama atau merestart lingkungan development.
- [ ] **Atur ulang CORS** — Error `Origin http://localhost:5174 tidak diizinkan oleh CORS` muncul saat refresh token dari port 5174; perlu diperbaiki di `backend/src/app.js` atau hanya gunakan port `5173` saja.
- [ ] **Larasi Prisma `melting_point`** — Error `The column elements.melting_point does not exist` masih muncul meski sudah `migrate reset`; perlu `prisma migrate reset` total + penyesuaian schema/database agar konsisten.
- [ ] **Verifikasi kalkulator kimia lewat browser** — Pastikan `usePageMeta` bekerja, form submit ke API sukses, dan state `submitting` tidak bermasalah di `CalculatorPage.vue`.
- [ ] **Verifikasi kuis lewat browser** — Pastikan jawaban tersimpan, skor terhitung, dan navigasi antar soal berfungsi di `QuizPage.vue`.
- [ ] **Ringkas dokumentasi cara menjalankan** — Buat README singkat: `npm run dev` (frontend di 5173), `npm run dev` (backend di 5000), cara migrate database, serta kredensial login default.
