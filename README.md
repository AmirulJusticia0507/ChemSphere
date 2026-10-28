# ChemSphere

Aplikasi pembelajaran kimia berbasis web untuk menjelajahi tabel periodik, ion poliatomik, kuis, kalkulator stoikiometri, serta panel admin untuk pengelolaan data.

## Tech Stack

- **Frontend**: [Vue 3](https://vuejs.org/), [Vite](https://vitejs.dev/), [Vue Router](https://router.vuejs.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Express 5](https://expressjs.com/), [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/) (Neon)
- **Auth**: JWT (access + refresh token, httpOnly cookie)
- **Deployment**: Vercel (Frontend + Serverless API)

## Struktur Proyek

```text
ChemSphere/
├── backend/   # REST API Express + Prisma
├── frontend/  # SPA Vue 3
├── api/       # Vercel serverless entry
└── docs/      # Aset pendukung
```

## Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) >= 18
- PostgreSQL (atau gunakan Neon)

### 1) Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # sesuaikan nilai jika perlu
```

Isi minimal `.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET=ubah-ke-random-string
JWT_REFRESH_SECRET=ubah-ke-random-string-lain
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174
SEED_ADMIN_EMAIL=admin@chemsphere.local
SEED_ADMIN_PASSWORD=ChemSphere123!
```

Jalankan migrasi & generate client:

```bash
npx prisma migrate dev
npx prisma generate
npm run seed  # isi data unsur, kategori, ion & admin (opsional)
```

Jalankan backend:

```bash
npm run dev
# API berjalan di http://localhost:5000
```

### 2) Setup Frontend

```bash
cd frontend
npm install
npm run dev
# App berjalan di http://localhost:5173
```

Frontend otomatis mem-proxy `/api` ke backend via konfigurasi Vite.

## Kredensial Default

Setelah `npm run seed` di backend:

- **Email**: `admin@chemsphere.local`
- **Password**: `ChemSphere123!`
- **Role**: `admin`

Bisa dipakai untuk mengakses halaman `/admin`.

## Endpoint Penting

| Endpoint | Keterangan |
| --- | --- |
| `GET /health` | Health check |
| `GET /api/v1/elements` | Daftar unsur (118 data) |
| `GET /api/v1/categories` | Daftar kategori |
| `GET /api/v1/ions` | Daftar ion poliatomik |
| `POST /api/v1/auth/login` | Login |
| `GET /api/v1/learn/quiz` | Mulai kuis |
| `POST /api/v1/learn/quiz/submit` | Submit kuis |

## Build & Test

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend (cek sintaks)
cd backend
node --check src/app.js
```

## Lisensi
Proyek ini dibuat untuk pembelajaran. Semua data kimia disajikan untuk tujuan edukatif.
