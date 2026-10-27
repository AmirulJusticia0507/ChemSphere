# System Design & UI/UX Guidelines

---

## 🎨 UI/UX Theme & Layout

- **Design System:** Clean, Data-Dense Admin Dashboard.
- **Color Palette:**
  - Primary: `#1E40AF` (Tailwind Blue 800)
  - Secondary: `#0F172A` (Tailwind Slate 900)
  - Accent: `#10B981` (Tailwind Emerald 500)
  - Background: `#F8FAFC` (Tailwind Slate 50)
- **Typography:** Inter / Plus Jakarta Sans.

---

## 🗄 Database Design (ERD Concept)

Sistem menggunakan skema relasional pada PostgreSQL dengan entitas utama berikut:

```text
  +---------------+        1:N        +---------------+
  |     USERS     | ----------------> |     LOGS      |
  +---------------+                   +---------------+
  | id (PK)       |                   | id (PK)       |
  | name          |                   | user_id (FK)  |
  | email         |                   | action        |
  | password      |                   | timestamp     |
  | role          |                   +---------------+
  +---------------+
          |
         1:N
          v
  +---------------+
  |   RESOURCES   |
  +---------------+
  | id (PK)       |
  | user_id (FK)  |
  | title         |
  | status        |
  +---------------+
📑 Data Dictionary Contoh (users)
Field Name	Data Type	Constraint	Description
id	UUID / BIGINT	PK, Not Null	Unique Identifier
email	VARCHAR(255)	Unique, Not Null	Alamat Email Login
password	VARCHAR(255)	Not Null	Hashed Password (bcrypt)
role	VARCHAR(50)	Default 'user'	Role Akses (admin, user)
created_at	TIMESTAMP	Default NOW()	Waktu Registrasi

```
