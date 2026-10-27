# TODO ChemSphere

## Fondasi

- [x] Siapkan aplikasi frontend Vue 3 dan Tailwind CSS.
- [x] Lengkapi API Express serta konfigurasi environment backend.
- [x] Buat skema dan migrasi PostgreSQL.

## Fitur utama

- [x] Tampilkan tabel periodik Bahasa Indonesia dari `docs/assets/periodic-table-polyatomic-id.svg`.
- [ ] Tambahkan pencarian, filter kategori, golongan, dan periode unsur.
- [ ] Buat halaman detail unsur: nomor atom, massa atom, konfigurasi elektron, sifat, kegunaan, dan peringatan bahaya.
- [x] Tampilkan detail ion poliatomik yang tersedia pada tabel.
- [x] Tambahkan autentikasi pengguna bila fitur memerlukan akun.

## Data dan administrasi

- [x] Siapkan data awal unsur, kategori, dan ion poliatomik.
- [x] Tambahkan panel admin untuk mengelola konten bila data perlu diperbarui melalui aplikasi.
- [x] Tambahkan peran pengguna dan otorisasi untuk fitur admin.

## Pengalaman pengguna

- [ ] Buat tampilan responsif untuk desktop dan perangkat seluler.
- [ ] Pastikan navigasi keyboard, kontras warna, dan teks alternatif aksesibel.
- [ ] Tambahkan state loading, kosong, dan error pada halaman utama.

## Kualitas

- [ ] Uji alur utama frontend dan API.
- [ ] Validasi input, tangani error API, dan lindungi endpoint yang memerlukan autentikasi.
- [x] Tambahkan seed database untuk lingkungan pengembangan.
- [ ] Dokumentasikan cara menjalankan aplikasi.
- [ ] Siapkan konfigurasi deployment, environment produksi, dan backup database.
