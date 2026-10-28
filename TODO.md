# Todo ChemSphere

## Prioritas Tinggi (Segera Dikerjakan)
- [ ] **Halaman detail ion (`/ion/:id`)** - Buat route dan halaman terpisah untuk detail ion poliatomik, mirip seperti halaman detail unsur `/unsur/:id`. Berguna untuk share link langsung ke ion tertentu.
- [ ] **Bandingkan Unsur (Compare)** - Pilih 2-4 unsur dan bandingkan sifatnya (nomor atom, massa atom, golongan/periode, konfigurasi elektron, dll). Bisa dibuat halaman baru `/bandingkan`.
- [ ] **Pencarian Global** - Tambahkan search bar di `SiteHeader` untuk mencari unsur/ion berdasarkan nama, simbol, atau nomor atom, lalu langsung redirect ke halaman detail.
- [ ] **Favorit/Bookmark** - Simpan unsur favorit ke `localStorage` (bisa dipindahkan ke database jika user login). Tambahkan tombol favorit di halaman detail unsur dan bisa diakses di halaman khusus.

## Prioritas Menengah (Bisa Ditindaklanjuti)
- [ ] **Flashcard Mode** - Kartu balik (flip card) untuk hafalan simbol/nama/sifat unsur. Berbeda dari QuizPage.
- [ ] **Kalkulator Massa Molar yang Lebih Kuat** - Dapat memparse rumus kimia seperti `H2O`, `Ca(OH)2`, `Al2(SO4)3` dan menghitung massa molar berdasarkan data unsur yang tersedia di DB.
- [ ] **Filter Tabel Periodik Lanjutan** - Tambahkan filter berdasarkan blok (`s,p,d,f`), wujud pada suhu kamar (padat/cair/gas), radioaktif, atau logam/metaloid/nonlogam.
- [ ] **Mode Gelap (Dark Mode)** - Tambahkan toggle dark mode di header, simpan di `localStorage`, dukungan untuk Tailwind CSS v4.

## Prioritas Nice-to-have (Pelengkap)
- [ ] **Tren Periodik Interaktif** - Visualisasi tren seperti jari-jari atom, elektronegativitas, energi ionisasi dalam bentuk grafik/heatmap per unsur.
- [ ] **Tabel Kelarutan** - Tabel sederhana untuk pelajar SMA/MA (larut/tak larut/sebagian larut) + penjelasan singkat.
- [ ] **PWA (Installable)** - Bisa di-install ke HP layaknya aplikasi untuk belajar offline.
- [ ] **Elemen Hari Ini (Element of the Day)** - Random unsur tiap hari dengan fakta unik, ditampilkan di beranda.
