// Data valensi unsur untuk generator rumus senyawa.
//
// valency      : bilangan oksidasi positif utama, dipakai untuk silang valensi
//                pada senyawa kovalen dan sebagai muatan kation.
// anionValency : besar muatan saat unsur bertindak sebagai anion.
// states       : bilangan oksidasi positif yang lazim, dipakai untuk
//                menawarkan alternatif senyawa (mis. FeO dan Fe2O3).
// kind         : logam | nonlogam | metaloid | gas-mulia

const V = {}

function add(symbols, data) {
  for (const symbol of symbols) V[symbol] = { ...data }
}

// Gas mulia: praktis tidak membentuk senyawa ionik atau kovalen biasa.
add(['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'], { valency: 0, kind: 'gas-mulia', states: [] })

// Golongan 1 - logam alkali
add(['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'], { valency: 1, kind: 'logam', states: [1] })

// Golongan 2 - logam alkali tanah
add(['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'], { valency: 2, kind: 'logam', states: [2] })

// Golongan 3
add(['Sc', 'Y'], { valency: 3, kind: 'logam', states: [3] })

// Golongan 4
add(['Ti', 'Zr', 'Hf'], { valency: 4, kind: 'logam', states: [4] })

// Golongan 5
add(['V', 'Nb', 'Ta'], { valency: 5, kind: 'logam', states: [5] })

// Golongan 6
add(['Mo', 'W'], { valency: 6, kind: 'logam', states: [6] })
V.Cr = { valency: 3, kind: 'logam', states: [2, 3, 6] }

// Golongan 7
add(['Tc', 'Re'], { valency: 7, kind: 'logam', states: [7] })
V.Mn = { valency: 2, kind: 'logam', states: [2, 4, 7] }

// Golongan 8
V.Fe = { valency: 3, kind: 'logam', states: [2, 3] }
V.Ru = { valency: 3, kind: 'logam', states: [3] }
V.Os = { valency: 4, kind: 'logam', states: [4] }

// Golongan 9
add(['Rh', 'Ir'], { valency: 3, kind: 'logam', states: [3] })
V.Co = { valency: 2, kind: 'logam', states: [2, 3] }

// Golongan 10
add(['Ni', 'Pd'], { valency: 2, kind: 'logam', states: [2] })
V.Pt = { valency: 2, kind: 'logam', states: [2, 4] }

// Golongan 11
V.Cu = { valency: 2, kind: 'logam', states: [1, 2] }
V.Ag = { valency: 1, kind: 'logam', states: [1] }
V.Au = { valency: 3, kind: 'logam', states: [1, 3] }

// Golongan 12
add(['Zn', 'Cd'], { valency: 2, kind: 'logam', states: [2] })
V.Hg = { valency: 2, kind: 'logam', states: [1, 2] }

// Golongan 13
add(['Al', 'Ga', 'In'], { valency: 3, kind: 'logam', states: [3] })
V.B = { valency: 3, kind: 'metaloid', states: [3], anionValency: 3 }
V.Tl = { valency: 1, kind: 'logam', states: [1, 3] }

// Golongan 14
V.C = { valency: 4, kind: 'nonlogam', states: [2, 4], anionValency: 4 }
V.Si = { valency: 4, kind: 'metaloid', states: [4], anionValency: 4 }
V.Ge = { valency: 4, kind: 'metaloid', states: [4] }
V.Sn = { valency: 4, kind: 'logam', states: [2, 4] }
V.Pb = { valency: 2, kind: 'logam', states: [2, 4] }

// Golongan 15
V.N = { valency: 3, kind: 'nonlogam', states: [3, 5], anionValency: 3 }
V.P = { valency: 5, kind: 'nonlogam', states: [3, 5], anionValency: 3 }
V.As = { valency: 3, kind: 'metaloid', states: [3, 5], anionValency: 3 }
V.Sb = { valency: 3, kind: 'metaloid', states: [3, 5] }
V.Bi = { valency: 3, kind: 'logam', states: [3, 5] }

// Golongan 16
V.O = { valency: 2, kind: 'nonlogam', states: [2], anionValency: 2 }
V.S = { valency: 6, kind: 'nonlogam', states: [4, 6], anionValency: 2 }
V.Se = { valency: 6, kind: 'nonlogam', states: [4, 6], anionValency: 2 }
V.Te = { valency: 4, kind: 'metaloid', states: [4, 6], anionValency: 2 }
V.Po = { valency: 2, kind: 'metaloid', states: [2, 4] }

// Golongan 17 - halogen
V.F = { valency: 1, kind: 'nonlogam', states: [1], anionValency: 1 }
V.Cl = { valency: 1, kind: 'nonlogam', states: [1, 3, 5, 7], anionValency: 1 }
V.Br = { valency: 1, kind: 'nonlogam', states: [1, 3, 5], anionValency: 1 }
V.I = { valency: 1, kind: 'nonlogam', states: [1, 3, 5, 7], anionValency: 1 }
V.At = { valency: 1, kind: 'nonlogam', states: [1], anionValency: 1 }

// Hidrogen: kation H+ atau anion hidrida H-
V.H = { valency: 1, kind: 'nonlogam', states: [1], anionValency: 1 }

// Lantanida dan aktinida: hampir selalu +3
add(
  ['La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu'],
  { valency: 3, kind: 'logam', states: [3] },
)
add(
  ['Ac', 'Th', 'Pa', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr'],
  { valency: 3, kind: 'logam', states: [3] },
)
V.U = { valency: 6, kind: 'logam', states: [3, 4, 6] }

export const ELEMENT_VALENCY = V

// Nama anion monoatomik dalam Bahasa Indonesia.
export const ANION_NAMES = {
  H: 'hidrida',
  B: 'borida',
  C: 'karbida',
  N: 'nitrida',
  O: 'oksida',
  F: 'fluorida',
  Si: 'silisida',
  P: 'fosfida',
  S: 'sulfida',
  Cl: 'klorida',
  As: 'arsenida',
  Se: 'selenida',
  Br: 'bromida',
  Te: 'telurida',
  I: 'iodida',
  At: 'astatida',
}

// Awalan jumlah atom untuk tata nama kovalen.
export const COVALENT_PREFIX = [
  '',
  'mono',
  'di',
  'tri',
  'tetra',
  'penta',
  'heksa',
  'hepta',
  'okta',
  'nona',
  'deka',
]

// Urutan keelektronegatifan untuk menentukan unsur mana yang ditulis lebih dulu
// pada senyawa biner kovalen (kiri = kurang elektronegatif).
export const ELECTRONEGATIVITY_ORDER = [
  'B', 'Si', 'C', 'Sb', 'As', 'P', 'N', 'H', 'Te', 'Se', 'S', 'I', 'Br', 'Cl', 'O', 'F',
]

// Ion poliatomik yang lazim. `contains` dipakai untuk menawarkan alternatif
// ketika pengguna memilih pasangan logam + unsur nonlogam terkait.
export const POLYATOMIC_IONS = [
  { formula: 'NH4', charge: 1, name: 'amonium', display: 'NH₄', polarity: 'kation', contains: ['N'] },
  { formula: 'OH', charge: 1, name: 'hidroksida', display: 'OH', polarity: 'anion', contains: ['O'] },
  { formula: 'NO3', charge: 1, name: 'nitrat', display: 'NO₃', polarity: 'anion', contains: ['N'] },
  { formula: 'NO2', charge: 1, name: 'nitrit', display: 'NO₂', polarity: 'anion', contains: ['N'] },
  { formula: 'CN', charge: 1, name: 'sianida', display: 'CN', polarity: 'anion', contains: ['C', 'N'] },
  { formula: 'HCO3', charge: 1, name: 'bikarbonat', display: 'HCO₃', polarity: 'anion', contains: ['C'] },
  { formula: 'CH3COO', charge: 1, name: 'asetat', display: 'CH₃COO', polarity: 'anion', contains: ['C'] },
  { formula: 'ClO3', charge: 1, name: 'klorat', display: 'ClO₃', polarity: 'anion', contains: ['Cl'] },
  { formula: 'ClO', charge: 1, name: 'hipoklorit', display: 'ClO', polarity: 'anion', contains: ['Cl'] },
  { formula: 'MnO4', charge: 1, name: 'permanganat', display: 'MnO₄', polarity: 'anion', contains: ['Mn'] },
  { formula: 'SO4', charge: 2, name: 'sulfat', display: 'SO₄', polarity: 'anion', contains: ['S'] },
  { formula: 'SO3', charge: 2, name: 'sulfit', display: 'SO₃', polarity: 'anion', contains: ['S'] },
  { formula: 'CO3', charge: 2, name: 'karbonat', display: 'CO₃', polarity: 'anion', contains: ['C'] },
  { formula: 'CrO4', charge: 2, name: 'kromat', display: 'CrO₄', polarity: 'anion', contains: ['Cr'] },
  { formula: 'Cr2O7', charge: 2, name: 'dikromat', display: 'Cr₂O₇', polarity: 'anion', contains: ['Cr'] },
  { formula: 'PO4', charge: 3, name: 'fosfat', display: 'PO₄', polarity: 'anion', contains: ['P'] },
]

// Nama dan catatan untuk senyawa yang punya nama trivial atau lebih dikenal.
// Kunci memakai rumus ASCII tanpa subskrip.
export const CURATED_COMPOUNDS = {
  H2O: {
    name: 'Air',
    description: 'Senyawa kovalen paling umum; pelarut universal dalam kimia dan biologi.',
  },
  H2O2: {
    name: 'Hidrogen peroksida',
    description: 'Oksidator kuat yang dipakai sebagai disinfektan dan pemutih.',
  },
  NH3: {
    name: 'Amonia',
    description: 'Gas berbau tajam, bahan baku utama pupuk nitrogen melalui proses Haber-Bosch.',
  },
  CH4: {
    name: 'Metana',
    description: 'Komponen utama gas alam; gas rumah kaca yang jauh lebih kuat dari CO₂ per molekul.',
  },
  CO2: {
    name: 'Karbon dioksida',
    description: 'Hasil pembakaran sempurna karbon; dipakai dalam minuman berkarbonasi dan pemadam api.',
  },
  CO: {
    name: 'Karbon monoksida',
    description: 'Gas tidak berwarna dan tidak berbau yang sangat beracun karena mengikat hemoglobin.',
  },
  NaCl: {
    name: 'Natrium klorida',
    description: 'Garam dapur; contoh klasik ikatan ionik dengan kisi kubus berpusat muka.',
  },
  HCl: {
    name: 'Hidrogen klorida',
    description: 'Gas asam; larutannya dalam air dikenal sebagai asam klorida (asam lambung).',
  },
  Al2O3: {
    name: 'Aluminium oksida',
    description: 'Dikenal sebagai alumina; mineral korundum, bahan dasar logam aluminium dan abrasif.',
  },
  SiO2: {
    name: 'Silikon dioksida',
    description: 'Komponen utama pasir dan kuarsa; bahan dasar kaca dan keramik.',
  },
  CaO: {
    name: 'Kalsium oksida',
    description: 'Kapur tohor; dihasilkan dari pemanasan batu kapur dan dipakai dalam mortar.',
  },
  CaCO3: {
    name: 'Kalsium karbonat',
    description: 'Batu kapur dan marmer; bahan semen, kapur tulis, dan antasida.',
  },
  Fe2O3: {
    name: 'Besi(III) oksida',
    description: 'Komponen utama karat dan mineral hematit; dipakai sebagai pigmen merah.',
  },
  FeO: {
    name: 'Besi(II) oksida',
    description: 'Oksida besi berwarna hitam yang terbentuk pada kondisi minim oksigen.',
  },
  CuO: {
    name: 'Tembaga(II) oksida',
    description: 'Serbuk hitam yang dipakai sebagai pigmen keramik dan katalis.',
  },
  Cu2O: {
    name: 'Tembaga(I) oksida',
    description: 'Serbuk merah bata; dipakai dalam cat anti-fouling dan sel fotovoltaik.',
  },
  MgO: {
    name: 'Magnesium oksida',
    description: 'Oksida tahan panas dengan titik leleh sangat tinggi; bahan refraktori.',
  },
  SO2: {
    name: 'Sulfur dioksida',
    description: 'Gas berbau menyengat; produk samping pembakaran sulfur, penyebab hujan asam.',
  },
  SO3: {
    name: 'Sulfur trioksida',
    description: 'Gas yang bereaksi hebat dengan air membentuk asam sulfat.',
  },
  NO2: {
    name: 'Nitrogen dioksida',
    description: 'Gas cokelat kemerahan; polutan utama asap kendaraan dan pembentuk smog.',
  },
  N2O: {
    name: 'Dinitrogen monoksida',
    description: 'Gas tertawa; dipakai sebagai anestesi dan gas rumah kaca.',
  },
  NaOH: {
    name: 'Natrium hidroksida',
    description: 'Soda kaustik; basa kuat yang dipakai luas dalam industri sabun dan pulp.',
  },
  KBr: {
    name: 'Kalium bromida',
    description: 'Garam ionik yang pernah dipakai sebagai sedatif dan kini dalam fotografi.',
  },
  NH4Cl: {
    name: 'Amonium klorida',
    description: 'Garam yang menyublim saat dipanaskan; dipakai sebagai elektrolit baterai dan pupuk.',
  },
  CaSO4: {
    name: 'Kalsium sulfat',
    description: 'Bentuk hidratnya adalah gipsum, bahan papan bangunan dan cetakan medis.',
  },
  NaHCO3: {
    name: 'Natrium bikarbonat',
    description: 'Soda kue; melepas CO₂ saat dipanaskan atau bereaksi dengan asam.',
  },
}
