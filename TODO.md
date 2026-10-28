#  TODO ChemSpher

##  Fondas

- [x] Siapkan aplikasi frontend Vue 3 dan Tailwind CSS
- [x] Lengkapi API Express serta konfigurasi environment backend
- [x] Buat skema dan migrasi PostgreSQL

##  Fitur utam

- [x] Tampilkan tabel periodik Bahasa Indonesia dari`docs/assets/periodic-table-polyatomic-id.svg``
- [x] Tambahkan pencarian, filter kategori, golongan, dan periode unsur
- [x] Buat halaman detail unsur: nomor atom, massa atom, konfigurasi elektron, sifat, kegunaan, dan peringatan bahaya
- [x] Tampilkan detail ion poliatomik yang tersedia pada tabel
- [x] Tambahkan autentikasi pengguna bila fitur memerlukan akun

##  Data dan administras

- [x] Siapkan data awal unsur, kategori, dan ion poliatomik
- [x] Tambahkan panel admin untuk mengelola konten bila data perlu diperbarui melalui aplikasi
- [x] Tambahkan peran pengguna dan otorisasi untuk fitur admin

##  Pengalaman penggun

- [x] Buat tampilan responsif untuk desktop dan perangkat seluler
- [x] Pastikan navigasi keyboard, kontras warna, dan teks alternatif aksesibel
- [x] Tambahkan state loading, kosong, dan error pada halaman utama

##  Kualita

- [x] Uji alur utama frontend dan API
- [x] Validasi input, tangani error API, dan lindungi endpoint yang memerlukan autentikasi
- [x] Tambahkan seed database untuk lingkungan pengembangan
- [x] Dokumentasikan cara menjalankan aplikasi
- [x] Siapkan konfigurasi deployment, environment produksi, dan backup database

##  Catatan Progres Terakhir (Desember 2026

###  Fitur tambahan setelah TODO.md dibua

1. **\*SEO (Search Engine Optimization**
   - Sitemap dinamis`/sitemap.xml`` (halaman statis + 118 unsur via UUID)
   - `robots.txt`` (disallow`/admin``,`/masuk``,`/daftar``,`/progres``, arahkan ke sitemap)
   - Meta tags dinamis di setiap halaman via`usePageMeta`` composable:`title``,`description``,`og:*``,`twitter:*``
   - JSON-LD`ChemicalSubstance`` di halaman detail unsur untuk rich result pencarian kimia
   - `index.html`` memuat meta lengkap (description, keywords, autor, Open Graph, Twitter Card, JSON-LD`WebApplication`` dengan`offers price: 0 IDR``)

2. **\*Paginasi Admin (Server-Side**
   - Backend `elementController``,`categoryController``,`ionController``) mendukung query`page`` +`limit`` ΓåÆ respons`{ data, pagination: { page, limit, total, totalPages } }``
   - Frontend: komponen`DataTable.vue`` (dinamis, kolom custom, slot cell) +`Pagination.vue`` (navigasi`ΓÇ╣ 1 2 ΓÇª 12 ΓÇ║``, info "Menampilkan XΓÇôY dari Y data")
   - Opt-in: kalau`page```limit`` tidak dikirim, return array utuh (tidak memecah`TablePage```HomePage``)

3. **\*Theming Krem/Biru Editoria**
   - Gaya dari referensi andikadevs.space: latar krem`#fff9f1``, font**\*Bricolage Grotesqu*** (judul),**\*Space Grotes*** (body),**\*JetBrains Mon*** (label uppercase)
   - Warna aksen: biru`#2b6cb0``, kuning`#ffda3f``, koral`#fc9073``
   - Pill button hitam mono uppercase, label`[ Label ]``, hairline border warna`#e4dccb``
   - Verifikasi lewat headless browser: 0 console error, tampilan desktop & mobile 390px rapi

4. **\*Aksesibilitas Tingkat Lanju**
   - Skip-to-content link `Lewati ke konten utama``) +`id="konten-utama"``
   - Focus ring global`:focus-visible`` outline navy 3px, tanpa outline programatis
   - Kontras:`--color-coral-ink`` digelapkan`#df5c42 ΓåÆ #b8442f`` (3.5:1 ΓåÆ ~5:1, lolos WCAG AA)
   - `text-coral`` ΓåÆ`text-coral-ink`` sebagai warna teks.`bg-coral`` + teks navy tetap (6.4:1)
   - Titik`Γùë`` dekoratif:`aria-hidden="true"`` di 5 lokasi
   - ElementTile:`RouterLink`` dengan`aria-label`` +`focus-visible``

5. **\*Halaman Auth (Login/Register**
   - Visual direstyle ke tema krem + pill hitam mono uppercase
   - Eyebrow`[ AKUN PENGGUNA ]`` /`[ AKUN BARU ]``
   - Tombol`MASUK```BUAT AKUN`` pakai state`submitting`` lokal (bukan global loading dari auth store)
   - Login sukses kredensial:`admin@chemsphere.local`` /`ChemSphere123!``

Semua build`npm run build`` sukses tanpa error. Semua fitur ini ter-commit ke`main`` (commit terakhir`3c5b3750``)

###  Belum Selesai (Infrastruktur & Verifikasi

- [x] **\*Binding port backen*** — proses lama pada port 5000 telah dihentikan; API aktif dan health check lulus
- [x] **\*CORS developmen*** — origin localhost port 5173/5174 dan 127.0.0.1 diizinkan
- [x] **\*Migrasi Prisma`melting_point`*** — migrasi telah diterapkan dan endpoint unsur kembali merespons 200
- [x] **\*Verifikasi kalkulator kimi*** — kalkulator memakai data unsur dari API dan parser rumus bertingkat telah diuji di unit test
- [x] **\*Verifikasi kui*** — alur mulai, navigasi, submit, skor, dan riwayat tersedia melalui API dan UI
- [x] **\*Dokumentasi cara menjalanka*** — README memuat setup, migrasi, port, dan kredensial default

##  Fitur Yang Belum Ada (Rencana Pengembangan

###  Prioritas Tinggi (Segera Dikerjakan

- [x] **\*Halaman detail ion (/ion/:id*** - Route dan halaman detail ion poliatomik tersedia untuk tautan langsung
- [ ] **\*Bandingkan Unsur (Compare*** - Pilih 2-4 unsur dan bandingkan sifatnya (nomor atom, massa atom, golongan/periode, konfigurasi elektron, dll). Bisa dibuat halaman baru /bandingkan
- [ ] **\*Pencarian Globa*** - Tambahkan search bar di SiteHeader untuk mencari unsur/ion berdasarkan nama, simbol, atau nomor atom, lalu langsung redirect ke halaman detail
- [x] **\*Favorit/Bookmar*** - Bookmark tersimpan per akun di database, tersedia dari detail unsur dan halaman progres

###  Prioritas Menengah (Bisa Ditindaklanjuti

- [ ] **\*Flashcard Mod*** - Kartu balik (flip card) untuk hafalan simbol/nama/sifat unsur. Berbeda dari QuizPage
- [x] **\*Kalkulator Massa Molar yang Lebih Kua*** - Parser mendukung rumus bertingkat seperti H2O, Ca(OH)2, dan Al2(SO4)3 dengan data massa atom API
- [ ] **\*Filter Tabel Periodik Lanjuta*** - Tambahkan filter berdasarkan blok (s,p,d,f), wujud pada suhu kamar (padat/cair/gas), radioaktif, atau logam/metaloid/nonlogam
- [ ] **\*Mode Gelap (Dark Mode*** - Tambahkan toggle dark mode di header, simpan di localStorage, dukungan untuk Tailwind CSS v4

###  Prioritas Nice-to-have (Pelengkap

- [ ] **\*Tren Periodik Interakti*** - Visualisasi tren seperti jari-jari atom, elektronegativitas, energi ionisasi dalam bentuk grafik/heatmap per unsur
- [ ] **\*Tabel Kelaruta*** - Tabel sederhana untuk pelajar SMA/MA (larut/tak larut/sebagian larut) + penjelasan singkat
- [x] **\*PWA (Installable*** - Manifest dan service worker produksi telah tersedia
- [ ] **\*Elemen Hari Ini (Element of the Day*** - Random unsur tiap hari dengan fakta unik, ditampilkan di beranda
