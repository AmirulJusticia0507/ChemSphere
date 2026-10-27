-- Index trigram untuk pencarian teks yang memakai ILIKE / contains.
--
-- Tanpa index ini, pencarian "besi" pada kolom nama menjalankan sequential
-- scan. pg_trgm memungkinkan PostgreSQL memakai index GIN untuk pola
-- LIKE '%...%' dan ILIKE '%...%'.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Unsur: pencarian pada nama Indonesia, nama Latin, dan simbol.
CREATE INDEX IF NOT EXISTS "elements_name_id_trgm_idx"
  ON "elements" USING GIN ("nameId" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "elements_name_latin_trgm_idx"
  ON "elements" USING GIN ("nameLatin" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "elements_symbol_trgm_idx"
  ON "elements" USING GIN ("symbol" gin_trgm_ops);

-- Ion poliatomik: pencarian pada nama dan rumus.
CREATE INDEX IF NOT EXISTS "polyatomic_ions_name_trgm_idx"
  ON "polyatomic_ions" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "polyatomic_ions_formula_trgm_idx"
  ON "polyatomic_ions" USING GIN ("formula" gin_trgm_ops);

-- Kategori: pencarian pada nama.
CREATE INDEX IF NOT EXISTS "categories_name_trgm_idx"
  ON "categories" USING GIN ("name" gin_trgm_ops);

-- Pengguna: pencarian nama dan email di panel admin.
CREATE INDEX IF NOT EXISTS "users_name_trgm_idx"
  ON "users" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "users_email_trgm_idx"
  ON "users" USING GIN ("email" gin_trgm_ops);
