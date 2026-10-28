# TODO ChemSphere

## Selesai

- [x] Frontend Vue 3, API Express, PostgreSQL, Prisma, seed, autentikasi, dan administrasi.
- [x] Tabel periodik, detail unsur, filter dasar, ion poliatomik, kuis, kalkulator, bookmark, dan progres belajar.
- [x] SEO, aksesibilitas, responsivitas, loading/error state, PWA, deployment, backup, dan dokumentasi lokal.
- [x] Perbaikan binding port, CORS development, dan migrasi `melting_point`.
- [x] Detail ion yang dapat dibagikan pada `/ion/:id`.
- [x] Perbandingan hingga empat unsur pada `/bandingkan`.
- [x] Pencarian header untuk unsur berdasarkan nama, simbol, atau nomor atom.
- [x] SweetAlert2 pada tindakan autentikasi dan CRUD utama.

## Belum dikerjakan

- [x] Flashcard mode dan tren elektronegativitas tersedia di `/belajar`.
- [x] Filter tabel periodik lanjutan: blok, fase, dan radioaktivitas.
- [x] Mode gelap tersimpan di browser.
- [x] Tren periodik interaktif (peringkat elektronegativitas) tersedia di `/belajar`.
- [x] Tabel kelarutan ringkas tersedia di `/belajar`.
- [x] Elemen hari ini di beranda, berganti otomatis berdasarkan tanggal.

## Pemeriksaan

- [x] `npm test` — 61 test lulus.
- [x] `npm run build --prefix frontend` — build produksi lulus.
- [x] Endpoint detail ion — respons 200 saat diverifikasi lokal.
- [x] Verifikasi CalculatorPage (/kalkulator) — halaman bisa diakses, kalkulator bekerja setelah data unsur dimuat dari API.
- [x] Verifikasi QuizPage — fitur topik, jawaban, timer, skor, dan riwayat bekerja (butuh login admin@chemsphere.local).
- [x] Dokumentasi quick start — README: `npm run dev` (frontend 5173), `npm run dev` (backend 5000), cara migrate, kredensial login.
