-- Role pengguna menjadi enum, ditambah status aktif dan jejak login terakhir.

CREATE TYPE "user_role" AS ENUM ('user', 'editor', 'admin');

-- Konversi kolom lama: nilai di luar enum diperlakukan sebagai 'user'.
ALTER TABLE "users"
  ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "user_role"
  USING (
    CASE lower("role")
      WHEN 'admin' THEN 'admin'::"user_role"
      WHEN 'editor' THEN 'editor'::"user_role"
      ELSE 'user'::"user_role"
    END
  );

ALTER TABLE "users"
  ALTER COLUMN "role" SET DEFAULT 'user'::"user_role";

-- Status akun: admin dapat menonaktifkan pengguna tanpa menghapus datanya.
ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Jejak login terakhir, berguna untuk audit akun.
ALTER TABLE "users" ADD COLUMN "last_login_at" TIMESTAMPTZ(6);

CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_is_active_idx" ON "users"("is_active");
