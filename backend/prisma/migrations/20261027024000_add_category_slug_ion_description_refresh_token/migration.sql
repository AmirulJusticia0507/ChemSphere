-- AlterTable: kategori mendapat slug unik
ALTER TABLE "categories" ADD COLUMN "slug" VARCHAR(50);

UPDATE "categories"
SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'));

ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- AlterTable: ion poliatomik mendapat deskripsi
ALTER TABLE "polyatomic_ions" ADD COLUMN "description" TEXT;

-- AlterTable: pengguna menyimpan refresh token
ALTER TABLE "users" ADD COLUMN "refresh_token" TEXT;
