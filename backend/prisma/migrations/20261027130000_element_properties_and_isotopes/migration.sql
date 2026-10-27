-- Properti fisika dan kimia tambahan untuk unsur, plus tabel isotop.

ALTER TABLE "elements"
  ADD COLUMN "melting_point" DECIMAL(10,3),
  ADD COLUMN "boiling_point" DECIMAL(10,3),
  ADD COLUMN "density" DECIMAL(12,6),
  ADD COLUMN "electronegativity" DECIMAL(5,3),
  ADD COLUMN "ionization_energy" DECIMAL(10,3),
  ADD COLUMN "atomic_radius" DECIMAL(8,3),
  ADD COLUMN "covalent_radius" DECIMAL(8,3),
  ADD COLUMN "molar_heat" DECIMAL(8,3),
  ADD COLUMN "oxidation_states" VARCHAR(100),
  ADD COLUMN "phase_at_room_temp" VARCHAR(20),
  ADD COLUMN "block" VARCHAR(5),
  ADD COLUMN "appearance" VARCHAR(255),
  ADD COLUMN "discovered_by" VARCHAR(150),
  ADD COLUMN "year_discovered" INTEGER;

CREATE TABLE "isotopes" (
  "id" UUID NOT NULL,
  "element_id" UUID NOT NULL,
  "mass_number" INTEGER NOT NULL,
  "abundance" DECIMAL(8,4),
  "half_life" VARCHAR(50),
  "is_radioactive" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "isotopes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "isotopes_element_id_mass_number_key" ON "isotopes"("element_id", "mass_number");

ALTER TABLE "isotopes"
  ADD CONSTRAINT "isotopes_element_id_fkey"
  FOREIGN KEY ("element_id") REFERENCES "elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
