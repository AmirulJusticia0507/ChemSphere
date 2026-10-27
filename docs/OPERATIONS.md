# Menjalankan dan mengoperasikan ChemSphere

## Pengembangan lokal

Prasyarat: Node.js 18+, PostgreSQL 14+, dan sebuah database kosong.

1. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `DATABASE_URL`, `JWT_SECRET`, dan `JWT_REFRESH_SECRET` dengan nilai lokal yang aman.
2. Jalankan `npm install` di `backend` dan `frontend`.
3. Di `backend`, jalankan `npm run migrate`, `npm run seed`, lalu `npm run dev`.
4. Di terminal lain, dari `frontend`, jalankan `npm run dev` dan buka `http://localhost:5173`.

Pengecekan cepat tersedia di `http://localhost:5000/health`. Jalankan `npm test` dari direktori `backend` dan `npm run build` dari `frontend` sebelum rilis.

## Produksi

Gunakan nilai unik dan rahasia untuk `JWT_SECRET`, `JWT_REFRESH_SECRET`, dan `DATABASE_URL`; jangan pernah memakai nilai contoh atau akun seed di produksi. Isi `CORS_ORIGIN` dengan origin frontend HTTPS yang sebenarnya dan set `NODE_ENV=production`.

`docker-compose.yml` membangun API dan frontend statis. Sebelum menjalankan `docker compose up -d --build`, sediakan file `backend/.env` produksi dan lakukan migrasi dengan `docker compose run --rm api npm run migrate:deploy`. Reverse proxy frontend menyajikan aplikasi Vue dan meneruskan `/api/` ke API internal.

## Backup dan pemulihan

Jalankan `scripts/backup.ps1` dari PowerShell dengan `DATABASE_URL` tersedia di environment atau lewat argumen `-DatabaseUrl`. Script membuat dump terkompresi PostgreSQL ke folder `backups/`; simpan folder itu di penyimpanan terenkripsi di luar server. Jadwalkan setidaknya satu kali sehari dan uji pemulihan secara berkala.

Contoh pemulihan:

```powershell
pg_restore --clean --if-exists --no-owner --dbname $env:DATABASE_URL .\backups\chemsphere-YYYYMMDD-HHMMSS.dump
```

## Index pencarian

Migrasi `20261027150000_search_trigram_indexes` mengaktifkan ekstensi `pg_trgm` dan
membuat index GIN pada kolom yang dipakai pencarian (`elements.nameId`,
`elements.nameLatin`, `elements.symbol`, `polyatomic_ions.name`,
`polyatomic_ions.formula`, `categories.name`, `users.name`, `users.email`).

Ekstensi ini membutuhkan hak superuser pada sebagian penyedia database. Bila
`CREATE EXTENSION` ditolak, minta admin database mengaktifkannya lebih dulu:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Setelah ekstensi tersedia, jalankan `npx prisma migrate deploy`. Pencarian tetap
berfungsi tanpa index ini, hanya lebih lambat pada tabel besar.
