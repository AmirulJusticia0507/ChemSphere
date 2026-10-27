// Keterangan tambahan untuk ion poliatomik yang umum dijumpai.
// Kunci memakai rumus tanpa tanda muatan, misalnya "SO4".
export const ionInfo = {
  NH4: {
    description:
      'Kation poliatomik yang terbentuk ketika amonia menerima proton. Hampir semua garam amonium mudah larut dalam air.',
    example: 'NH₄Cl (amonium klorida)',
  },
  OH: {
    description:
      'Anion yang bertanggung jawab atas sifat basa. Terbentuk saat basa melepaskan ion hidroksida dalam air.',
    example: 'NaOH (natrium hidroksida)',
  },
  NO3: {
    description:
      'Anion okso nitrogen yang stabil dan merupakan oksidator. Semua garam nitrat larut dalam air.',
    example: 'KNO₃ (kalium nitrat)',
  },
  NO2: {
    description:
      'Anion okso nitrogen dengan muatan -1. Berperan dalam pembentukan garam nitrit dan pengawetan makanan.',
    example: 'NaNO₂ (natrium nitrit)',
  },
  SO4: {
    description:
      'Anion okso sulfur yang banyak ditemukan dalam garam sulfat. Sebagian besar sulfat larut, kecuali barium sulfat dan timbal(II) sulfat.',
    example: 'CuSO₄ (tembaga(II) sulfat)',
  },
  SO3: {
    description:
      'Anion okso sulfur dengan muatan -2, merupakan basa konjugasi dari ion hidrogen sulfit.',
    example: 'Na₂SO₃ (natrium sulfit)',
  },
  CO3: {
    description:
      'Anion okso karbon yang menjadi dasar garam karbonat. Bereaksi dengan asam menghasilkan gas karbon dioksida.',
    example: 'CaCO₃ (kalsium karbonat)',
  },
  HCO3: {
    description:
      'Anion bikarbonat yang berperan sebagai penyangga pH dalam darah dan air alami.',
    example: 'NaHCO₃ (natrium bikarbonat)',
  },
  PO4: {
    description:
      'Anion okso fosfor dengan muatan -3. Merupakan komponen penting dalam pupuk dan senyawa biologis.',
    example: 'Ca₃(PO₄)₂ (kalsium fosfat)',
  },
  ClO4: {
    description:
      'Anion perklorat dengan muatan -1. Bersifat oksidator kuat, terutama dalam suasana asam.',
    example: 'KClO₄ (kalium perklorat)',
  },
  ClO3: {
    description:
      'Anion klorat yang digunakan sebagai oksidator dalam korek api dan bahan peledak.',
    example: 'KClO₃ (kalium klorat)',
  },
  ClO: {
    description: 'Anion hipoklorit, zat aktif utama dalam pemutih dan disinfektan.',
    example: 'NaClO (natrium hipoklorit)',
  },
  MnO4: {
    description:
      'Anion permanganat berwarna ungu yang merupakan oksidator kuat dan sering dipakai dalam titrasi.',
    example: 'KMnO₄ (kalium permanganat)',
  },
  Cr2O7: {
    description:
      'Anion dikromat berwarna oranye dengan muatan -2. Berperan sebagai oksidator dalam suasana asam.',
    example: 'K₂Cr₂O₇ (kalium dikromat)',
  },
  CrO4: {
    description: 'Anion kromat berwarna kuning yang banyak digunakan sebagai pigmen.',
    example: 'PbCrO₄ (timbal(II) kromat)',
  },
  CN: {
    description:
      'Anion sianida yang sangat beracun karena mengikat besi dalam enzim sitokrom oksidase.',
    example: 'NaCN (natrium sianida)',
  },
  SCN: {
    description: 'Anion tiosianat yang sering dipakai untuk menguji keberadaan ion besi(III).',
    example: 'KSCN (kalium tiosianat)',
  },
  CH3COO: {
    description:
      'Anion asetat, basa konjugasi dari asam asetat. Banyak garam asetat mudah larut dalam air.',
    example: 'CH₃COOH (asam asetat)',
  },
  C2O4: {
    description:
      'Anion oksalat yang dapat membentuk endapan dengan ion kalsium dan digunakan sebagai standar titrasi.',
    example: 'Na₂C₂O₄ (natrium oksalat)',
  },
  S2O3: {
    description:
      'Anion tiosulfat yang dipakai dalam fotografi dan sebagai zat pereduksi dalam titrasi iodometri.',
    example: 'Na₂S₂O₃ (natrium tiosulfat)',
  },
  BO3: {
    description: 'Anion borat yang ditemukan dalam garam boron dan bahan pengawet.',
    example: 'Na₂B₄O₇ (natrium tetraborat)',
  },
  SiO3: {
    description:
      'Anion silikat yang menjadi penyusun utama mineral dan kaca, dengan struktur rantai yang beragam.',
    example: 'Na₂SiO₃ (natrium silikat)',
  },
  O2: {
    description:
      'Anion peroksida dengan ikatan O–O tunggal. Bersifat oksidator dan ditemukan dalam hidrogen peroksida.',
    example: 'H₂O₂ (hidrogen peroksida)',
  },
  H3O: {
    description:
      'Kation hidronium yang terbentuk ketika asam melepaskan proton kepada molekul air.',
    example: 'H₃O⁺ dalam larutan asam',
  },
  N3: {
    description: 'Anion azida yang digunakan dalam airbag dan bersifat sangat reaktif.',
    example: 'NaN₃ (natrium azida)',
  },
}

export function ionBaseFormula(formula) {
  const subscripts = '₀₁₂₃₄₅₆₇₈₉'

  return String(formula ?? '')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (character) => String(subscripts.indexOf(character)))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, '')
    .replace(/\s/g, '')
}

export function infoForIon(formula) {
  return ionInfo[ionBaseFormula(formula)] ?? null
}
