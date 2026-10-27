import 'dotenv/config'

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Properti fisika dan kimia per simbol unsur, diambil dari dataset referensi
// publik (Periodic-Table-JSON) dan disimpan lokal agar seed dapat diulang
// tanpa akses jaringan.
const elementProperties = JSON.parse(
  await readFile(join(__dirname, 'element-properties.json'), 'utf8'),
)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const categories = [
  { slug: 'alkali', name: 'Logam Alkali' },
  { slug: 'alkaline', name: 'Logam Alkali Tanah' },
  { slug: 'transition', name: 'Logam Transisi' },
  { slug: 'post-transition', name: 'Logam Pasca-transisi' },
  { slug: 'metalloid', name: 'Metaloid' },
  { slug: 'nonmetal', name: 'Nonlogam' },
  { slug: 'halogen', name: 'Halogen' },
  { slug: 'noble-gas', name: 'Gas Mulia' },
  { slug: 'lanthanide', name: 'Lantanida' },
  { slug: 'actinide', name: 'Aktinida' },
]

const categoryDefaults = {
  alkali: {
    uses: 'Reagen kimia, baterai, dan sintesis senyawa.',
    hazard: 'Sangat reaktif terhadap air dan kulit; simpan dalam minyak mineral.',
  },
  alkaline: {
    uses: 'Paduan logam, bahan bangunan, dan reagen kimia.',
    hazard: 'Reaktif terhadap air; debu logam dapat mengiritasi kulit dan saluran napas.',
  },
  transition: {
    uses: 'Konstruksi, katalis, dan peralatan listrik.',
    hazard: 'Debu dan senyawa tertentu dapat bersifat toksik; gunakan pelindung.',
  },
  'post-transition': {
    uses: 'Paduan logam, pelapis, dan komponen elektronik.',
    hazard: 'Beberapa senyawa bersifat toksik; hindari paparan debu berlebih.',
  },
  metalloid: {
    uses: 'Semikonduktor, paduan logam, dan bahan optik.',
    hazard: 'Debu dapat mengiritasi saluran pernapasan.',
  },
  nonmetal: {
    uses: 'Bahan kimia industri, pupuk, dan kebutuhan biologis.',
    hazard: 'Tangani sesuai lembar data keselamatan bahan.',
  },
  halogen: {
    uses: 'Disinfektan, sintesis organik, dan bahan kimia industri.',
    hazard: 'Korosif dan beracun; gunakan alat pelindung diri.',
  },
  'noble-gas': {
    uses: 'Lampu, pendingin, dan atmosfer pelindung.',
    hazard: 'Dapat menyebabkan sesak napas pada ruang tertutup.',
  },
  lanthanide: {
    uses: 'Magnet permanen, fosfor, dan katalis.',
    hazard: 'Debu logam dapat mengiritasi; beberapa isotop bersifat radioaktif ringan.',
  },
  actinide: {
    uses: 'Riset nuklir dan sumber radiasi.',
    hazard: 'Radioaktif; penanganan memerlukan prosedur keselamatan khusus.',
  },
}

const categoryLabels = {
  alkali: 'logam alkali',
  alkaline: 'logam alkali tanah',
  transition: 'logam transisi',
  'post-transition': 'logam pasca-transisi',
  metalloid: 'metaloid',
  nonmetal: 'nonlogam',
  halogen: 'halogen',
  'noble-gas': 'gas mulia',
  lanthanide: 'logam lantanida',
  actinide: 'logam aktinida',
}

// [nomor atom, lambang, nama Indonesia, nama Latin, massa atom, kategori, periode, golongan]
const rawElements = [
  [1, 'H', 'Hidrogen', 'Hydrogenium', 1.008, 'nonmetal', 1, 1],
  [2, 'He', 'Helium', 'Helium', 4.0026, 'noble-gas', 1, 18],
  [3, 'Li', 'Litium', 'Lithium', 6.94, 'alkali', 2, 1],
  [4, 'Be', 'Berilium', 'Beryllium', 9.0122, 'alkaline', 2, 2],
  [5, 'B', 'Boron', 'Borium', 10.81, 'metalloid', 2, 13],
  [6, 'C', 'Karbon', 'Carbonium', 12.011, 'nonmetal', 2, 14],
  [7, 'N', 'Nitrogen', 'Nitrogenium', 14.007, 'nonmetal', 2, 15],
  [8, 'O', 'Oksigen', 'Oxygenium', 15.999, 'nonmetal', 2, 16],
  [9, 'F', 'Fluor', 'Fluorum', 18.998, 'halogen', 2, 17],
  [10, 'Ne', 'Neon', 'Neon', 20.18, 'noble-gas', 2, 18],
  [11, 'Na', 'Natrium', 'Natrium', 22.99, 'alkali', 3, 1],
  [12, 'Mg', 'Magnesium', 'Magnesium', 24.305, 'alkaline', 3, 2],
  [13, 'Al', 'Aluminium', 'Aluminium', 26.982, 'post-transition', 3, 13],
  [14, 'Si', 'Silikon', 'Silicium', 28.085, 'metalloid', 3, 14],
  [15, 'P', 'Fosfor', 'Phosphorus', 30.974, 'nonmetal', 3, 15],
  [16, 'S', 'Sulfur', 'Sulfur', 32.06, 'nonmetal', 3, 16],
  [17, 'Cl', 'Klorin', 'Chlorum', 35.45, 'halogen', 3, 17],
  [18, 'Ar', 'Argon', 'Argon', 39.948, 'noble-gas', 3, 18],
  [19, 'K', 'Kalium', 'Kalium', 39.098, 'alkali', 4, 1],
  [20, 'Ca', 'Kalsium', 'Calcium', 40.078, 'alkaline', 4, 2],
  [21, 'Sc', 'Skandium', 'Scandium', 44.956, 'transition', 4, 3],
  [22, 'Ti', 'Titanium', 'Titanium', 47.867, 'transition', 4, 4],
  [23, 'V', 'Vanadium', 'Vanadium', 50.942, 'transition', 4, 5],
  [24, 'Cr', 'Kromium', 'Chromium', 51.996, 'transition', 4, 6],
  [25, 'Mn', 'Mangan', 'Manganum', 54.938, 'transition', 4, 7],
  [26, 'Fe', 'Besi', 'Ferrum', 55.845, 'transition', 4, 8],
  [27, 'Co', 'Kobalt', 'Cobaltum', 58.933, 'transition', 4, 9],
  [28, 'Ni', 'Nikel', 'Niccolum', 58.693, 'transition', 4, 10],
  [29, 'Cu', 'Tembaga', 'Cuprum', 63.546, 'transition', 4, 11],
  [30, 'Zn', 'Seng', 'Zincum', 65.38, 'transition', 4, 12],
  [31, 'Ga', 'Galium', 'Gallium', 69.723, 'post-transition', 4, 13],
  [32, 'Ge', 'Germanium', 'Germanium', 72.63, 'metalloid', 4, 14],
  [33, 'As', 'Arsen', 'Arsenicum', 74.922, 'metalloid', 4, 15],
  [34, 'Se', 'Selenium', 'Selenium', 78.971, 'nonmetal', 4, 16],
  [35, 'Br', 'Bromin', 'Bromum', 79.904, 'halogen', 4, 17],
  [36, 'Kr', 'Kripton', 'Krypton', 83.798, 'noble-gas', 4, 18],
  [37, 'Rb', 'Rubidium', 'Rubidium', 85.468, 'alkali', 5, 1],
  [38, 'Sr', 'Stronsium', 'Strontium', 87.62, 'alkaline', 5, 2],
  [39, 'Y', 'Ytrium', 'Yttrium', 88.906, 'transition', 5, 3],
  [40, 'Zr', 'Zirkonium', 'Zirconium', 91.224, 'transition', 5, 4],
  [41, 'Nb', 'Niobium', 'Niobium', 92.906, 'transition', 5, 5],
  [42, 'Mo', 'Molibdenum', 'Molybdenum', 95.95, 'transition', 5, 6],
  [43, 'Tc', 'Teknesium', 'Technetium', 98, 'transition', 5, 7],
  [44, 'Ru', 'Rutenium', 'Ruthenium', 101.07, 'transition', 5, 8],
  [45, 'Rh', 'Rodium', 'Rhodium', 102.91, 'transition', 5, 9],
  [46, 'Pd', 'Paladium', 'Palladium', 106.42, 'transition', 5, 10],
  [47, 'Ag', 'Perak', 'Argentum', 107.87, 'transition', 5, 11],
  [48, 'Cd', 'Kadmium', 'Cadmium', 112.41, 'transition', 5, 12],
  [49, 'In', 'Indium', 'Indium', 114.82, 'post-transition', 5, 13],
  [50, 'Sn', 'Timah', 'Stannum', 118.71, 'post-transition', 5, 14],
  [51, 'Sb', 'Antimon', 'Stibium', 121.76, 'metalloid', 5, 15],
  [52, 'Te', 'Telurium', 'Tellurium', 127.6, 'metalloid', 5, 16],
  [53, 'I', 'Iodin', 'Iodum', 126.9, 'halogen', 5, 17],
  [54, 'Xe', 'Xenon', 'Xenon', 131.29, 'noble-gas', 5, 18],
  [55, 'Cs', 'Sesium', 'Caesium', 132.91, 'alkali', 6, 1],
  [56, 'Ba', 'Barium', 'Barium', 137.33, 'alkaline', 6, 2],
  [57, 'La', 'Lantanum', 'Lanthanum', 138.91, 'lanthanide', 6, 3],
  [58, 'Ce', 'Serium', 'Cerium', 140.12, 'lanthanide', 6, 3],
  [59, 'Pr', 'Praseodimium', 'Praseodymium', 140.91, 'lanthanide', 6, 3],
  [60, 'Nd', 'Neodimium', 'Neodymium', 144.24, 'lanthanide', 6, 3],
  [61, 'Pm', 'Prometium', 'Promethium', 145, 'lanthanide', 6, 3],
  [62, 'Sm', 'Samarium', 'Samarium', 150.36, 'lanthanide', 6, 3],
  [63, 'Eu', 'Europium', 'Europium', 151.96, 'lanthanide', 6, 3],
  [64, 'Gd', 'Gadolinium', 'Gadolinium', 157.25, 'lanthanide', 6, 3],
  [65, 'Tb', 'Terbium', 'Terbium', 158.93, 'lanthanide', 6, 3],
  [66, 'Dy', 'Disprosium', 'Dysprosium', 162.5, 'lanthanide', 6, 3],
  [67, 'Ho', 'Holmium', 'Holmium', 164.93, 'lanthanide', 6, 3],
  [68, 'Er', 'Erbium', 'Erbium', 167.26, 'lanthanide', 6, 3],
  [69, 'Tm', 'Tulium', 'Thulium', 168.93, 'lanthanide', 6, 3],
  [70, 'Yb', 'Iterbium', 'Ytterbium', 173.05, 'lanthanide', 6, 3],
  [71, 'Lu', 'Lutesium', 'Lutetium', 174.97, 'lanthanide', 6, 3],
  [72, 'Hf', 'Hafnium', 'Hafnium', 178.49, 'transition', 6, 4],
  [73, 'Ta', 'Tantalum', 'Tantalum', 180.95, 'transition', 6, 5],
  [74, 'W', 'Wolfram', 'Wolframium', 183.84, 'transition', 6, 6],
  [75, 'Re', 'Renium', 'Rhenium', 186.21, 'transition', 6, 7],
  [76, 'Os', 'Osmium', 'Osmium', 190.23, 'transition', 6, 8],
  [77, 'Ir', 'Iridium', 'Iridium', 192.22, 'transition', 6, 9],
  [78, 'Pt', 'Platinum', 'Platinum', 195.08, 'transition', 6, 10],
  [79, 'Au', 'Emas', 'Aurum', 196.97, 'transition', 6, 11],
  [80, 'Hg', 'Raksa', 'Hydrargyrum', 200.59, 'transition', 6, 12],
  [81, 'Tl', 'Talium', 'Thallium', 204.38, 'post-transition', 6, 13],
  [82, 'Pb', 'Timbal', 'Plumbum', 207.2, 'post-transition', 6, 14],
  [83, 'Bi', 'Bismut', 'Bismuthum', 208.98, 'post-transition', 6, 15],
  [84, 'Po', 'Polonium', 'Polonium', 209, 'post-transition', 6, 16],
  [85, 'At', 'Astatin', 'Astatinum', 210, 'halogen', 6, 17],
  [86, 'Rn', 'Radon', 'Radon', 222, 'noble-gas', 6, 18],
  [87, 'Fr', 'Fransium', 'Francium', 223, 'alkali', 7, 1],
  [88, 'Ra', 'Radium', 'Radium', 226, 'alkaline', 7, 2],
  [89, 'Ac', 'Aktinium', 'Actinium', 227, 'actinide', 7, 3],
  [90, 'Th', 'Torium', 'Thorium', 232.04, 'actinide', 7, 3],
  [91, 'Pa', 'Protaktinium', 'Protactinium', 231.04, 'actinide', 7, 3],
  [92, 'U', 'Uranium', 'Uranium', 238.03, 'actinide', 7, 3],
  [93, 'Np', 'Neptunium', 'Neptunium', 237, 'actinide', 7, 3],
  [94, 'Pu', 'Plutonium', 'Plutonium', 244, 'actinide', 7, 3],
  [95, 'Am', 'Amerisium', 'Americium', 243, 'actinide', 7, 3],
  [96, 'Cm', 'Kurium', 'Curium', 247, 'actinide', 7, 3],
  [97, 'Bk', 'Berkelium', 'Berkelium', 247, 'actinide', 7, 3],
  [98, 'Cf', 'Kalifornium', 'Californium', 251, 'actinide', 7, 3],
  [99, 'Es', 'Einsteinsium', 'Einsteinium', 252, 'actinide', 7, 3],
  [100, 'Fm', 'Fermium', 'Fermium', 257, 'actinide', 7, 3],
  [101, 'Md', 'Mendelevium', 'Mendelevium', 258, 'actinide', 7, 3],
  [102, 'No', 'Nobelium', 'Nobelium', 259, 'actinide', 7, 3],
  [103, 'Lr', 'Lawrensium', 'Lawrencium', 266, 'actinide', 7, 3],
  [104, 'Rf', 'Rutherfordium', 'Rutherfordium', 267, 'transition', 7, 4],
  [105, 'Db', 'Dubnium', 'Dubnium', 268, 'transition', 7, 5],
  [106, 'Sg', 'Seaborgium', 'Seaborgium', 269, 'transition', 7, 6],
  [107, 'Bh', 'Bohrium', 'Bohrium', 270, 'transition', 7, 7],
  [108, 'Hs', 'Hasium', 'Hassium', 269, 'transition', 7, 8],
  [109, 'Mt', 'Meitnerium', 'Meitnerium', 278, 'transition', 7, 9],
  [110, 'Ds', 'Darmstadtium', 'Darmstadtium', 281, 'transition', 7, 10],
  [111, 'Rg', 'Roentgenium', 'Roentgenium', 282, 'transition', 7, 11],
  [112, 'Cn', 'Kopernisium', 'Copernicium', 285, 'transition', 7, 12],
  [113, 'Nh', 'Nihonium', 'Nihonium', 286, 'post-transition', 7, 13],
  [114, 'Fl', 'Flerovium', 'Flerovium', 289, 'post-transition', 7, 14],
  [115, 'Mc', 'Moskovium', 'Moscovium', 290, 'post-transition', 7, 15],
  [116, 'Lv', 'Livermorium', 'Livermorium', 293, 'post-transition', 7, 16],
  [117, 'Ts', 'Tenesin', 'Tennessine', 294, 'halogen', 7, 17],
  [118, 'Og', 'Oganeson', 'Oganesson', 294, 'noble-gas', 7, 18],
]

const details = {
  H: {
    description: 'Unsur paling ringan dan paling melimpah di alam semesta; menyusun sekitar tiga per empat massa bintang.',
    uses: 'Bahan bakar sel bahan bakar, produksi amonia, dan hidrogenasi minyak.',
    hazard: 'Sangat mudah terbakar dan dapat membentuk campuran eksplosif dengan udara.',
  },
  He: {
    description: 'Gas mulia tak berwarna, tak berbau, dan tak beracun dengan titik didih terendah di antara semua unsur.',
    uses: 'Pendingin MRI, pengisi balon, dan atmosfer pelindung pada pengelasan.',
    hazard: 'Dapat menyebabkan sesak napas jika menggantikan oksigen di ruang tertutup.',
  },
  Li: {
    description: 'Logam alkali paling ringan; lunak, berwarna perak, dan sangat reaktif.',
    uses: 'Baterai litium-ion, paduan logam, dan obat penstabil suasana hati.',
    hazard: 'Mereaksi keras dengan air dan bersifat korosif.',
  },
  Be: {
    description: 'Logam alkali tanah yang ringan dan kaku, dengan titik leleh tinggi.',
    uses: 'Komponen kedirgantaraan, jendela sinar-X, dan paduan tembaga.',
    hazard: 'Debu berilium sangat beracun dan dapat menyebabkan penyakit paru kronis.',
  },
  B: {
    description: 'Metaloid yang ditemukan dalam boraks dan mineral boron; penting bagi pertumbuhan tanaman.',
    uses: 'Kaca borosilikat, deterjen, dan bahan semikonduktor.',
    hazard: 'Dapat mengiritasi kulit dan mata; hindari paparan debu.',
  },
  C: {
    description: 'Kerangka utama senyawa organik dan salah satu unsur paling melimpah di kerak bumi.',
    uses: 'Bahan bakar, baja, pensil, dan material karbon canggih.',
    hazard: 'Umumnya aman; debu karbon dapat mengiritasi saluran napas.',
  },
  N: {
    description: 'Gas nonlogam yang menyusun sekitar 78% atmosfer Bumi.',
    uses: 'Pupuk, atmosfer inert, dan pengawetan makanan.',
    hazard: 'Dapat menyebabkan sesak napas jika menggantikan oksigen di ruang tertutup.',
  },
  O: {
    description: 'Gas nonlogam esensial untuk pernapasan dan pembakaran; unsur paling melimpah di kerak bumi.',
    uses: 'Pernapasan medis, pengolahan air, dan proses industri.',
    hazard: 'Mendukung pembakaran; konsentrasi tinggi meningkatkan risiko kebakaran.',
  },
  F: {
    description: 'Unsur paling elektronegatif dan paling reaktif di tabel periodik.',
    uses: 'Pasta gigi, refrigeran, dan sintesis senyawa fluor.',
    hazard: 'Sangat beracun dan korosif; menimbulkan luka bakar kimia serius.',
  },
  Ne: {
    description: 'Gas mulia yang memancarkan cahaya merah-oranye ketika dialiri listrik.',
    uses: 'Lampu neon dan indikator listrik.',
    hazard: 'Dapat menyebabkan sesak napas di ruang tertutup.',
  },
  Na: {
    description: 'Logam alkali lunak yang bereaksi hebat dengan air; komponen penting garam dapur.',
    uses: 'Garam dapur, lampu natrium, dan reagen kimia.',
    hazard: 'Mereaksi keras dengan air dan bersifat korosif.',
  },
  Mg: {
    description: 'Logam ringan berwarna perak yang terbakar dengan nyala putih terang.',
    uses: 'Paduan pesawat, antasida, dan kembang api.',
    hazard: 'Serbuk magnesium mudah terbakar dan sulit dipadamkan.',
  },
  Al: {
    description: 'Logam ringan, tahan korosi, dan paling melimpah di kerak bumi.',
    uses: 'Kemasan, konstruksi, kendaraan, dan kabel listrik.',
    hazard: 'Umumnya aman; debu halus berpotensi menimbulkan ledakan.',
  },
  Si: {
    description: 'Metaloid yang menjadi fondasi perangkat semikonduktor modern.',
    uses: 'Chip komputer, panel surya, dan paduan logam.',
    hazard: 'Debu silika dapat merusak paru-paru jika terhirup.',
  },
  P: {
    description: 'Nonlogam esensial bagi DNA, ATP, dan tulang; ditemukan dalam batuan fosfat.',
    uses: 'Pupuk, korek api, dan deterjen.',
    hazard: 'Fosfor putih mudah terbakar secara spontan dan sangat beracun.',
  },
  S: {
    description: 'Nonlogam kuning yang ditemukan dekat gunung berapi dan dalam mineral sulfida.',
    uses: 'Pupuk, vulkanisasi karet, dan asam sulfat.',
    hazard: 'Sulfur dioksida hasil pembakarannya merupakan polutan udara.',
  },
  Cl: {
    description: 'Halogen berwarna hijau kekuningan yang sangat reaktif.',
    uses: 'Penjernihan air, disinfektan, dan produksi PVC.',
    hazard: 'Gas beracun dan korosif; dapat merusak saluran pernapasan.',
  },
  Ar: {
    description: 'Gas mulia yang inert dan menyusun hampir 1% atmosfer Bumi.',
    uses: 'Atmosfer pelindung pengelasan, lampu, dan isolasi jendela.',
    hazard: 'Dapat menyebabkan sesak napas di ruang tertutup.',
  },
  K: {
    description: 'Logam alkali yang penting bagi fungsi sel dan ditemukan dalam banyak mineral.',
    uses: 'Pupuk, sabun, dan suplemen kalium.',
    hazard: 'Mereaksi hebat dengan air dan bersifat korosif.',
  },
  Ca: {
    description: 'Logam alkali tanah yang esensial untuk tulang, gigi, dan fungsi otot.',
    uses: 'Semen, baja, dan suplemen kalsium.',
    hazard: 'Reaktif terhadap air; dapat mengiritasi kulit dan mata.',
  },
  Sc: {
    description: 'Logam transisi ringan yang jarang ditemukan dan sering dipadukan dengan aluminium.',
    uses: 'Paduan kedirgantaraan dan lampu stadion.',
    hazard: 'Debu dapat mengiritasi; senyawa tertentu perlu ditangani hati-hati.',
  },
  Ti: {
    description: 'Logam transisi kuat, ringan, dan sangat tahan korosi.',
    uses: 'Implans medis, pesawat, dan pigmen titanium dioksida.',
    hazard: 'Umumnya aman; debu halus mudah terbakar.',
  },
  V: {
    description: 'Logam transisi keras yang meningkatkan kekuatan baja.',
    uses: 'Paduan baja, katalis, dan baterai aliran.',
    hazard: 'Senyawa vanadium dapat mengiritasi saluran napas.',
  },
  Cr: {
    description: 'Logam transisi berkilau yang memberikan warna pada baja tahan karat.',
    uses: 'Baja tahan karat, pelapisan krom, dan pigmen.',
    hazard: 'Kromium heksavalen bersifat karsinogenik dan sangat beracun.',
  },
  Mn: {
    description: 'Logam transisi yang penting untuk produksi baja dan fungsi enzim.',
    uses: 'Paduan baja, baterai, dan pigmen.',
    hazard: 'Paparan debu mangan berlebih dapat merusak sistem saraf.',
  },
  Fe: {
    description: 'Logam transisi paling banyak digunakan; inti Bumi sebagian besar tersusun dari besi.',
    uses: 'Konstruksi, baja, kendaraan, dan hemoglobin.',
    hazard: 'Umumnya aman; kelebihan zat besi dapat merusak organ.',
  },
  Co: {
    description: 'Logam transisi feromagnetik yang digunakan dalam paduan tahan panas.',
    uses: 'Baterai, magnet, dan pigmen biru.',
    hazard: 'Debu kobalt dapat mengiritasi paru-paru dan kulit.',
  },
  Ni: {
    description: 'Logam transisi keras, tahan korosi, dan banyak digunakan dalam paduan.',
    uses: 'Baja tahan karat, baterai, dan koin.',
    hazard: 'Senyawa nikel tertentu bersifat karsinogenik; dapat memicu alergi kulit.',
  },
  Cu: {
    description: 'Logam transisi dengan konduktivitas listrik dan panas yang sangat baik.',
    uses: 'Kabel listrik, pipa, dan paduan kuningan.',
    hazard: 'Umumnya aman; dosis besar dapat bersifat toksik.',
  },
  Zn: {
    description: 'Logam transisi yang melindungi baja dari korosi melalui pelapisan galvanis.',
    uses: 'Pelapisan anti-korosi, baterai, dan suplemen seng.',
    hazard: 'Debu seng dapat menyebabkan demam logam jika terhirup.',
  },
  Ga: {
    description: 'Logam pasca-transisi yang meleleh pada suhu tangan manusia.',
    uses: 'Semikonduktor, LED, dan paduan titik leleh rendah.',
    hazard: 'Dapat mengiritasi kulit; hindari paparan dalam bentuk cair.',
  },
  Ge: {
    description: 'Metaloid yang menjadi bahan semikonduktor awal sebelum silikon.',
    uses: 'Serat optik, inframerah, dan semikonduktor.',
    hazard: 'Senyawa germanium tertentu dapat bersifat toksik bagi ginjal.',
  },
  As: {
    description: 'Metaloid yang ditemukan dalam mineral sulfida dan dikenal sangat beracun.',
    uses: 'Paduan semikonduktor dan pengawet kayu.',
    hazard: 'Arsen anorganik sangat beracun dan bersifat karsinogenik.',
  },
  Se: {
    description: 'Nonlogam yang penting dalam dosis kecil bagi tubuh dan ditemukan pada fotokopi.',
    uses: 'Fotokonduktor, kaca, dan suplemen selenium.',
    hazard: 'Dosis berlebih dapat menyebabkan selenosis.',
  },
  Br: {
    description: 'Halogen cair berwarna merah kecokelatan dengan bau menyengat.',
    uses: 'Flame retardant, fotografi, dan senyawa farmasi.',
    hazard: 'Korosif, beracun, dan dapat menyebabkan luka bakar kulit.',
  },
  Kr: {
    description: 'Gas mulia yang digunakan dalam lampu kilat dan laser.',
    uses: 'Lampu kilat fotografi, laser, dan isolasi jendela.',
    hazard: 'Dapat menyebabkan sesak napas di ruang tertutup.',
  },
  Rb: {
    description: 'Logam alkali lunak yang sangat reaktif dan jarang ditemukan.',
    uses: 'Sel atom, pengukur waktu, dan riset.',
    hazard: 'Mereaksi hebat dengan air; bersifat korosif.',
  },
  Sr: {
    description: 'Logam alkali tanah yang memberikan warna merah pada kembang api.',
    uses: 'Kembang api, magnet, dan pigmen.',
    hazard: 'Reaktif terhadap air; debu dapat mengiritasi.',
  },
  Y: {
    description: 'Logam transisi yang digunakan dalam fosfor dan superkonduktor.',
    uses: 'Fosfor LED, keramik, dan superkonduktor.',
    hazard: 'Debu dapat mengiritasi saluran napas.',
  },
  Zr: {
    description: 'Logam transisi tahan korosi yang digunakan dalam reaktor nuklir.',
    uses: 'Kelongsong bahan bakar nuklir, keramik, dan implan.',
    hazard: 'Bubuk zirkonium mudah terbakar; debu dapat mengiritasi.',
  },
  Nb: {
    description: 'Logam transisi yang meningkatkan sifat superkonduktor dan kekuatan baja.',
    uses: 'Superkonduktor, paduan baja, dan magnet.',
    hazard: 'Debu dapat mengiritasi; senyawa tertentu perlu ditangani hati-hati.',
  },
  Mo: {
    description: 'Logam transisi dengan titik leleh tinggi dan penting bagi enzim.',
    uses: 'Paduan baja, pelumas, dan katalis.',
    hazard: 'Debu dapat mengiritasi saluran napas.',
  },
  Tc: {
    description: 'Logam transisi radioaktif pertama yang dibuat secara sintetis.',
    uses: 'Pencitraan medis dan riset nuklir.',
    hazard: 'Radioaktif; penanganan memerlukan prosedur keselamatan khusus.',
  },
  Ru: {
    description: 'Logam transisi langka yang tahan terhadap korosi dan digunakan sebagai katalis.',
    uses: 'Katalis, kontak listrik, dan paduan.',
    hazard: 'Senyawa rutenium tertentu dapat bersifat toksik.',
  },
  Rh: {
    description: 'Logam transisi berkilau dan sangat langka yang efektif sebagai katalis.',
    uses: 'Konverter katalitik, perhiasan, dan cermin optik.',
    hazard: 'Umumnya aman; debu dapat mengiritasi.',
  },
  Pd: {
    description: 'Logam transisi mulia yang mampu menyerap hidrogen dalam jumlah besar.',
    uses: 'Konverter katalitik, elektronik, dan kedokteran gigi.',
    hazard: 'Umumnya aman; senyawa tertentu dapat mengiritasi.',
  },
  Ag: {
    description: 'Logam mulia dengan konduktivitas listrik tertinggi di antara semua unsur.',
    uses: 'Perhiasan, elektronika, dan antibakteri.',
    hazard: 'Umumnya aman; paparan berkepanjangan dapat menyebabkan argiria.',
  },
  Cd: {
    description: 'Logam transisi lunak dan beracun yang digunakan dalam baterai.',
    uses: 'Baterai nikel-kadmium, pigmen, dan pelapisan.',
    hazard: 'Sangat beracun bagi ginjal dan tulang; bersifat karsinogenik.',
  },
  In: {
    description: 'Logam pasca-transisi lunak yang digunakan dalam lapisan transparan konduktif.',
    uses: 'Layar sentuh, solder, dan semikonduktor.',
    hazard: 'Senyawa indium dapat merusak paru-paru jika terhirup.',
  },
  Sn: {
    description: 'Logam pasca-transisi yang tahan korosi dan mudah dibentuk.',
    uses: 'Solder, pelapisan timah, dan paduan perunggu.',
    hazard: 'Umumnya aman; senyawa organotimah bersifat toksik.',
  },
  Sb: {
    description: 'Metaloid yang digunakan dalam paduan dan flame retardant.',
    uses: 'Flame retardant, baterai, dan paduan.',
    hazard: 'Senyawa antimon dapat bersifat toksik; debu mengiritasi.',
  },
  Te: {
    description: 'Metaloid langka yang digunakan dalam sel surya dan paduan.',
    uses: 'Panel surya, termoelektrik, dan paduan.',
    hazard: 'Paparan berlebih dapat menyebabkan bau napas khas dan gangguan saraf.',
  },
  I: {
    description: 'Halogen padat berwarna ungu kehitaman yang esensial bagi hormon tiroid.',
    uses: 'Antiseptik, garam beryodium, dan fotografi.',
    hazard: 'Uap iodin mengiritasi mata dan saluran napas.',
  },
  Xe: {
    description: 'Gas mulia berat yang digunakan dalam lampu dan anestesi.',
    uses: 'Lampu xenon, propelan ion, dan anestesi.',
    hazard: 'Dapat menyebabkan sesak napas; senyawa xenon bersifat oksidator.',
  },
  Cs: {
    description: 'Logam alkali paling reaktif dengan titik leleh sangat rendah.',
    uses: 'Jam atom, sel fotolistrik, dan riset.',
    hazard: 'Mereaksi hebat dengan air; sangat korosif.',
  },
  Ba: {
    description: 'Logam alkali tanah yang digunakan sebagai kontras sinar-X.',
    uses: 'Kontras radiologi, kembang api, dan pengeboran minyak.',
    hazard: 'Senyawa barium larut bersifat toksik; barium sulfat relatif aman.',
  },
  La: {
    description: 'Logam lantanida pertama yang digunakan dalam baterai dan lensa kamera.',
    uses: 'Baterai nikel-metal hidrida, lensa optik, dan katalis.',
    hazard: 'Debu dapat mengiritasi; senyawa tertentu perlu penanganan hati-hati.',
  },
  Ce: {
    description: 'Lantanida paling melimpah yang mudah teroksidasi dan digunakan sebagai katalis.',
    uses: 'Katalis, pemoles kaca, dan paduan.',
    hazard: 'Debu dapat mengiritasi; hindari menghirup partikel halus.',
  },
  Nd: {
    description: 'Lantanida yang menjadi komponen utama magnet permanen kuat.',
    uses: 'Magnet neodimium, laser, dan kaca berwarna.',
    hazard: 'Debu dapat mengiritasi; magnet kuat berbahaya bagi implan.',
  },
  Eu: {
    description: 'Lantanida yang menghasilkan fosfor merah pada layar dan lampu.',
    uses: 'Fosfor LED, uang kertas anti-palsu, dan layar.',
    hazard: 'Debu dapat mengiritasi; senyawa larut bersifat toksik ringan.',
  },
  Gd: {
    description: 'Lantanida feromagnetik yang digunakan sebagai agen kontras MRI.',
    uses: 'Kontras MRI, magnet, dan reaktor nuklir.',
    hazard: 'Senyawa gadolinium bebas dapat bersifat toksik bagi ginjal.',
  },
  W: {
    description: 'Logam transisi dengan titik leleh tertinggi di antara semua logam.',
    uses: 'Filamen lampu, alat potong, dan paduan tahan panas.',
    hazard: 'Debu dapat mengiritasi; umumnya aman dalam bentuk padat.',
  },
  Pt: {
    description: 'Logam transisi mulia yang sangat stabil dan efektif sebagai katalis.',
    uses: 'Konverter katalitik, perhiasan, dan alat laboratorium.',
    hazard: 'Umumnya aman; senyawa platinum tertentu dapat menyebabkan alergi.',
  },
  Au: {
    description: 'Logam mulia kuning yang tidak mudah teroksidasi dan sangat mudah ditempa.',
    uses: 'Perhiasan, elektronika, dan cadangan nilai.',
    hazard: 'Umumnya aman; senyawa emas tertentu dapat mengiritasi.',
  },
  Hg: {
    description: 'Logam transisi cair pada suhu kamar yang menguap dan sangat beracun.',
    uses: 'Lampu, termometer lama, dan amalgam gigi.',
    hazard: 'Uap merkuri merusak sistem saraf; hindari paparan sepenuhnya.',
  },
  Tl: {
    description: 'Logam pasca-transisi lunak yang sangat beracun dan tidak berbau.',
    uses: 'Detektor inframerah dan riset.',
    hazard: 'Sangat beracun; dapat diserap melalui kulit.',
  },
  Pb: {
    description: 'Logam pasca-transisi berat, lunak, dan mudah dibentuk.',
    uses: 'Baterai asam timbal, pelindung radiasi, dan paduan.',
    hazard: 'Sangat beracun, terutama bagi anak-anak; merusak sistem saraf.',
  },
  Bi: {
    description: 'Logam pasca-transisi berat yang relatif tidak beracun dan mudah membentuk kristal.',
    uses: 'Obat lambung, kosmetik, dan paduan titik leleh rendah.',
    hazard: 'Umumnya aman; penggunaan jangka panjang perlu pengawasan.',
  },
  Po: {
    description: 'Metaloid radioaktif yang sangat langka dan memancarkan radiasi alfa kuat.',
    uses: 'Sumber panas radioisotop dan riset.',
    hazard: 'Sangat radioaktif dan beracun; penanganan khusus wajib.',
  },
  At: {
    description: 'Halogen radioaktif paling langka yang hanya ada dalam jumlah sangat kecil.',
    uses: 'Riset kedokteran nuklir.',
    hazard: 'Sangat radioaktif; penanganan memerlukan fasilitas khusus.',
  },
  Rn: {
    description: 'Gas mulia radioaktif yang terbentuk dari peluruhan uranium di batuan.',
    uses: 'Riset geologi dan deteksi gempa.',
    hazard: 'Radioaktif dan merupakan penyebab kanker paru setelah merokok.',
  },
  Fr: {
    description: 'Logam alkali radioaktif yang sangat tidak stabil.',
    uses: 'Riset ilmiah.',
    hazard: 'Sangat radioaktif dan reaktif; hanya dapat ditangani dalam jumlah mikro.',
  },
  Ra: {
    description: 'Logam alkali tanah radioaktif yang memancarkan cahaya kebiruan.',
    uses: 'Riset dan sumber radiasi historis.',
    hazard: 'Sangat radioaktif; paparan dapat menyebabkan kanker tulang.',
  },
  U: {
    description: 'Aktinida radioaktif yang menjadi bahan bakar utama reaktor nuklir.',
    uses: 'Bahan bakar nuklir, senjata, dan riset.',
    hazard: 'Radioaktif dan beracun bagi ginjal; memerlukan pengendalian ketat.',
  },
  Pu: {
    description: 'Aktinida radioaktif yang digunakan dalam reaktor dan senjata nuklir.',
    uses: 'Bahan bakar nuklir dan sumber daya radioisotop.',
    hazard: 'Sangat radioaktif dan beracun; penanganan memerlukan fasilitas khusus.',
  },
  Am: {
    description: 'Aktinida sintetis yang digunakan dalam detektor asap.',
    uses: 'Detektor asap dan riset nuklir.',
    hazard: 'Radioaktif; hindari paparan dan hirupan debu.',
  },
  Cm: {
    description: 'Aktinida radioaktif yang memancarkan panas cukup untuk sumber daya.',
    uses: 'Sumber daya radioisotop dan riset.',
    hazard: 'Sangat radioaktif; penanganan memerlukan fasilitas khusus.',
  },
}

const exceptions = {
  24: '[Ar] 3d5 4s1',
  29: '[Ar] 3d10 4s1',
  41: '[Kr] 4d4 5s1',
  42: '[Kr] 4d5 5s1',
  44: '[Kr] 4d7 5s1',
  45: '[Kr] 4d8 5s1',
  46: '[Kr] 4d10',
  47: '[Kr] 4d10 5s1',
  57: '[Xe] 5d1 6s2',
  58: '[Xe] 4f1 5d1 6s2',
  64: '[Xe] 4f7 5d1 6s2',
  78: '[Xe] 4f14 5d9 6s1',
  79: '[Xe] 4f14 5d10 6s1',
  89: '[Rn] 6d1 7s2',
  90: '[Rn] 6d2 7s2',
  91: '[Rn] 5f2 6d1 7s2',
  92: '[Rn] 5f3 6d1 7s2',
  93: '[Rn] 5f4 6d1 7s2',
  96: '[Rn] 5f7 6d1 7s2',
  103: '[Rn] 5f14 7s2 7p1',
}

const orbitalOrder = [
  ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10],
  ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6], ['6s', 2], ['4f', 14], ['5d', 10],
  ['6p', 6], ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6],
]

const nobleGasCores = [
  [2, 'He'], [10, 'Ne'], [18, 'Ar'], [36, 'Kr'], [54, 'Xe'], [86, 'Rn'],
]

function orbitalSort([a], [b]) {
  const order = { s: 0, p: 1, d: 2, f: 3 }
  return Number(a[0]) - Number(b[0]) || order[a[1]] - order[b[1]]
}

function electronConfig(atomicNumber) {
  if (exceptions[atomicNumber]) return exceptions[atomicNumber]

  let remaining = atomicNumber
  const filled = []

  for (const [orbital, capacity] of orbitalOrder) {
    if (remaining <= 0) break
    const count = Math.min(capacity, remaining)
    filled.push([orbital, count])
    remaining -= count
  }

  const core = nobleGasCores.filter(([electrons]) => electrons < atomicNumber).pop()
  let orbitals = filled

  if (core) {
    let toSkip = core[0]
    orbitals = []

    for (const [orbital, count] of filled) {
      if (toSkip >= count) {
        toSkip -= count
        continue
      }
      orbitals.push([orbital, count - toSkip])
      toSkip = 0
    }
  }

  const notation = orbitals
    .filter(([, count]) => count > 0)
    .sort(orbitalSort)
    .map(([orbital, count]) => `${orbital}${count}`)
    .join(' ')

  return core ? `[${core[1]}] ${notation}` : notation
}

function defaultDescription(element) {
  if (element.category === 'lanthanide') {
    return `${element.nameId} adalah logam lantanida dengan nomor atom ${element.atomicNumber}, termasuk deret unsur tanah jarang.`
  }
  if (element.category === 'actinide') {
    return `${element.nameId} adalah logam aktinida radioaktif dengan nomor atom ${element.atomicNumber}.`
  }
  return `${element.nameId} (${element.symbol}) adalah ${categoryLabels[element.category]} dengan nomor atom ${element.atomicNumber}, terletak pada golongan ${element.group} dan periode ${element.period} tabel periodik.`
}

const ions = [
  ['Amonium', 'NH₄⁺', '+1', 'Kation poliatomik yang terbentuk ketika amonia menerima proton; hampir semua garam amonium larut dalam air.'],
  ['Hidroksida', 'OH⁻', '-1', 'Anion yang bertanggung jawab atas sifat basa dan terbentuk saat basa melepaskan ion hidroksida.'],
  ['Nitrat', 'NO₃⁻', '-1', 'Anion okso nitrogen yang stabil dan merupakan oksidator; semua garam nitrat larut dalam air.'],
  ['Nitrit', 'NO₂⁻', '-1', 'Anion okso nitrogen yang digunakan dalam garam nitrit dan pengawetan makanan.'],
  ['Sulfat', 'SO₄²⁻', '-2', 'Anion okso sulfur yang banyak ditemukan dalam garam sulfat; sebagian besar larut kecuali barium dan timbal(II) sulfat.'],
  ['Sulfit', 'SO₃²⁻', '-2', 'Anion okso sulfur yang merupakan basa konjugasi dari ion hidrogen sulfit.'],
  ['Karbonat', 'CO₃²⁻', '-2', 'Anion okso karbon yang menjadi dasar garam karbonat dan menghasilkan CO₂ saat bereaksi dengan asam.'],
  ['Bikarbonat', 'HCO₃⁻', '-1', 'Anion yang berperan sebagai penyangga pH dalam darah dan air alami.'],
  ['Fosfat', 'PO₄³⁻', '-3', 'Anion okso fosfor yang merupakan komponen penting pupuk dan senyawa biologis.'],
  ['Hidrogen fosfat', 'HPO₄²⁻', '-2', 'Anion fosfat terprotonasi yang berperan dalam sistem penyangga tubuh.'],
  ['Dihidrogen fosfat', 'H₂PO₄⁻', '-1', 'Anion fosfat dengan dua atom hidrogen, sering ditemukan dalam pupuk.'],
  ['Klorat', 'ClO₃⁻', '-1', 'Anion yang digunakan sebagai oksidator dalam korek api dan bahan peledak.'],
  ['Perklorat', 'ClO₄⁻', '-1', 'Anion perklorat yang bersifat oksidator kuat, terutama dalam suasana asam.'],
  ['Hipoklorit', 'ClO⁻', '-1', 'Anion yang menjadi zat aktif utama dalam pemutih dan disinfektan.'],
  ['Permanganat', 'MnO₄⁻', '-1', 'Anion berwarna ungu yang merupakan oksidator kuat dan sering dipakai dalam titrasi.'],
  ['Dikromat', 'Cr₂O₇²⁻', '-2', 'Anion berwarna oranye yang berperan sebagai oksidator dalam suasana asam.'],
  ['Kromat', 'CrO₄²⁻', '-2', 'Anion berwarna kuning yang banyak digunakan sebagai pigmen.'],
  ['Sianida', 'CN⁻', '-1', 'Anion yang sangat beracun karena mengikat besi dalam enzim sitokrom oksidase.'],
  ['Tiosianat', 'SCN⁻', '-1', 'Anion yang sering dipakai untuk menguji keberadaan ion besi(III).'],
  ['Asetat', 'CH₃COO⁻', '-1', 'Anion asetat, basa konjugasi dari asam asetat; banyak garamnya mudah larut.'],
  ['Oksalat', 'C₂O₄²⁻', '-2', 'Anion yang dapat membentuk endapan dengan ion kalsium dan digunakan sebagai standar titrasi.'],
  ['Tiosulfat', 'S₂O₃²⁻', '-2', 'Anion yang dipakai dalam fotografi dan sebagai zat pereduksi dalam titrasi iodometri.'],
  ['Borat', 'BO₃³⁻', '-3', 'Anion boron yang ditemukan dalam garam borat dan bahan pengawet.'],
  ['Silikat', 'SiO₃²⁻', '-2', 'Anion penyusun utama mineral dan kaca dengan struktur rantai yang beragam.'],
  ['Peroksida', 'O₂²⁻', '-2', 'Anion dengan ikatan O–O tunggal yang bersifat oksidator, ditemukan dalam hidrogen peroksida.'],
  ['Superoksida', 'O₂⁻', '-1', 'Anion radikal yang sangat reaktif dan ditemukan pada senyawa oksigen alkali.'],
  ['Ozonida', 'O₃⁻', '-1', 'Anion yang terbentuk dari ozon dan bersifat sangat reaktif.'],
  ['Hidronium', 'H₃O⁺', '+1', 'Kation yang terbentuk ketika asam melepaskan proton kepada molekul air.'],
  ['Azida', 'N₃⁻', '-1', 'Anion yang digunakan dalam airbag dan bersifat sangat reaktif.'],
  ['Sianat', 'OCN⁻', '-1', 'Anion pseudohalogen yang ditemukan dalam garam sianat.'],
]

async function main() {
  console.log('Menghapus data lama...')
  await prisma.element.deleteMany()
  await prisma.polyatomicIon.deleteMany()
  await prisma.category.deleteMany()

  console.log('Membuat kategori...')
  const categoryMap = {}
  for (const category of categories) {
    const created = await prisma.category.create({ data: category })
    categoryMap[category.slug] = created.id
  }

  console.log('Membuat unsur...')
  const elementData = rawElements.map(
    ([atomicNumber, symbol, nameId, nameLatin, atomicMass, category, period, group]) => {
      const detail = details[symbol] ?? {}
      const defaults = categoryDefaults[category]
      const base = { nameId, symbol, atomicNumber, category, period, group }
      const props = elementProperties[symbol] ?? {}

      return {
        atomicNumber,
        symbol,
        nameId,
        nameLatin,
        atomicMass,
        electronConfig: electronConfig(atomicNumber),
        period,
        group,
        description: detail.description ?? defaultDescription(base),
        uses: detail.uses ?? defaults.uses,
        hazardWarning: detail.hazard ?? defaults.hazard,
        categoryId: categoryMap[category],

        // Properti fisika dan kimia
        meltingPoint: props.melt ?? null,
        boilingPoint: props.boil ?? null,
        density: props.density ?? null,
        electronegativity: props.electronegativity ?? null,
        ionizationEnergy: props.ionization ?? null,
        atomicRadius: props.atomicRadius ?? null,
        covalentRadius: props.covalentRadius ?? null,
        molarHeat: props.molarHeat ?? null,
        oxidationStates: props.oxidationStates ?? null,
        phaseAtRoomTemp: props.phase ?? null,
        block: props.block ?? null,
        appearance: props.appearance ?? null,
        discoveredBy: props.discoveredBy ?? null,
        yearDiscovered: props.yearDiscovered ?? null,
      }
    },
  )

  await prisma.element.createMany({ data: elementData })

  console.log('Membuat ion poliatomik...')
  await prisma.polyatomicIon.createMany({
    data: ions.map(([name, formula, charge, description]) => ({ name, formula, charge, description })),
  })

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    console.log('Membuat akun admin...')
    const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10)
    await prisma.user.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL },
      update: { password, role: 'admin' },
      create: {
        name: 'Administrator',
        email: process.env.SEED_ADMIN_EMAIL,
        password,
        role: 'admin',
      },
    })
  }

  console.log('Seed selesai.')
  console.log(`- ${categories.length} kategori`)
  console.log(`- ${elementData.length} unsur`)
  console.log(`- ${ions.length} ion poliatomik`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
