-- Bookmark unsur dan riwayat percobaan kuis per pengguna.

CREATE TABLE "bookmarks" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "element_id" UUID NOT NULL,
  "note" VARCHAR(255),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookmarks_user_id_element_id_key" ON "bookmarks"("user_id", "element_id");
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

ALTER TABLE "bookmarks"
  ADD CONSTRAINT "bookmarks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmarks"
  ADD CONSTRAINT "bookmarks_element_id_fkey"
  FOREIGN KEY ("element_id") REFERENCES "elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "quiz_attempts" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "topic" VARCHAR(50) NOT NULL,
  "total" INTEGER NOT NULL,
  "correct" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "duration_sec" INTEGER,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "quiz_attempts_user_id_createdAt_idx" ON "quiz_attempts"("user_id", "createdAt");

ALTER TABLE "quiz_attempts"
  ADD CONSTRAINT "quiz_attempts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
