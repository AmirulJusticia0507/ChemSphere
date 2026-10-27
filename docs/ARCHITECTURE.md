---

### File 4: `docs/ARCHITECTURE.md`

````markdown
# System Architecture

---

## 🏗 High-Level Architecture Diagram

Sistem menggunakan pola arsitektur **Client-Server Separated (Decoupled Architecture)** dengan REST API sebagai media komunikasi.

```text
[ Browser / Client ]
        │
        ▼ (HTTP/HTTPS Requests)
┌─────────────────────────────────────────────────────────┐
│ Frontend (Vue.js + Pinia + Vue Router)                  │
│ Port: 5173 / 80                                         │
└─────────────────────────────────────────────────────────┘
        │
        ▼ (REST API Call - JSON)
┌─────────────────────────────────────────────────────────┐
│ Express.js API Gateway / Server                         │
│ Port: 5000                                              │
│                                                         │
│  ├── Auth Middleware (JWT Verification)                 │
│  ├── Controller Layer (Business Logic)                 │
│  └── Data Access Layer (ORM / SQL Query)                │
└─────────────────────────────────────────────────────────┘
        │
        ▼ (PostgreSQL Connection Protocol)
┌─────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                     │
│ Port: 5432                                              │
└─────────────────────────────────────────────────────────┘
🔒 Security Architecture
Authentication Flow:

Client mengirim credentials (email/password) via POST /api/v1/auth/login.

Express memverifikasi password via bcrypt.

Server menerbitkan JWT Access Token & Refresh Token.

Token dikirim ke Client dan disimpan secara aman (HttpOnly Cookie atau Pinia Memory).

Setiap protected request menyertakan token pada header: Authorization: Bearer <token>.

Database Security:

Parameterized Queries / ORM untuk mencegah SQL Injection.

Environment variables (.env) untuk credential DB.


---

Kalo kamu butuh penyesuaian khusus (misalnya nama aplikasinya, jenis ORM yang dipakai seperti Prisma/Sequelize, atau penambahan diagram ERD/Sequence Diagram yang lebih rinci), kasih tahu aja biar aku sesuaikan!

<FollowUp label="Mau disesuaikan dengan studi kasus atau nama project tertentu?" query="Bisa sesuaikan template dokumen di atas untuk nama project dan kasus spesifik?"/>
```
````
