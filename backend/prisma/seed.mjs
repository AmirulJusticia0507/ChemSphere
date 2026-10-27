import dotenv from 'dotenv'
dotenv.config()

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const categories = [
  { name: 'Logam Alkali' },
  { name: 'Logam Alkaline Tanah' },
  { name: 'Logam Transisi' },
  { name: 'Logam Lemah' },
  { name: 'Nonlogam' },
  { name: 'Halogen' },
  { name: 'Gas Mulia' },
  { name: 'Metaloid' },
]

const elements = [
  // atomicNumber, symbol, nameId, nameLatin, atomicMass, electronConfig, category, period, group, description, uses, hazardWarning
  {
    atomicNumber: 1, symbol: 'H', nameId: 'Hidrogen', nameLatin: 'Hydrogen',
    atomicMass: 1.0080, electronConfig: '1s1', category: 'Nonlogam', period: 1, group: 1,
    description: 'Unsur ringan paling ringan dan paling melimpah di seluruh universum.',
    uses: 'Bahan bakar, produksi amoniak, selang udara.',
    hazardWarning: 'Sangat mudah terbakar, dapat menyebabkan peledak.',
  },
  {
    atomicNumber: 2, symbol: 'He', nameId: 'Helium', nameLatin: 'Helium',
    atomicMass: 4.0026, electronConfig: '1s2', category: 'Gas Mulia', period: 1, group: 18,
    description: 'Gas mulia yang ringan, tidak berwarna, tidak berbau, dan tidak beracun.',
    uses: 'Mengisi balon, pendingin MRI, udara bernyala.',
    hazardWarning: 'Dapat menyebabkan kerusakan suara bila dihirup berlebihan.',
  },
  {
    atomicNumber: 3, symbol: 'Li', nameId: 'Litium', nameLatin: 'Lithium',
    atomicMass: 6.9400, electronConfig: '[He] 2s1', category: 'Logam Alkali', period: 2, group: 1,
    description: 'Logam alkali yang lunak, berwarna perak putih, sangat reaktif.',
    uses: 'Baterai, obat stabilisasi mood, alloy.',
    hazardWarning: 'Mereaksi keras dengan air, korosif.',
  },
  {
    atomicNumber: 4, symbol: 'Be', nameId: 'Beryllium', nameLatin: 'Beryllium',
    atomicMass: 9.0122, electronConfig: '[He] 2s2', category: 'Logam Alkaline Tanah', period: 2, group: 2,
    description: 'Logam alkaline tanah yang kokoh dan ringan.',
    uses: 'Aplikasi penerbangan, jendela sinar X.',
    hazardWarning: 'Beracun jika dihirup, dapat menyebabkan penyakit beryllium.',
  },
  {
    atomicNumber: 5, symbol: 'B', nameId: 'Bor', nameLatin: 'Boron',
    atomicMass: 10.8100, electronConfig: '[He] 2s2 2p1', category: 'Metaloid', period: 2, group: 13,
    description: 'Metaloid yang penting bagi tumbuh-tumbuhan.',
    uses: 'Kaca pireks, obat antiseptik, semiconductor.',
    hazardWarning: 'Berkesan iritasi pada kulit dan mata.',
  },
  {
    atomicNumber: 6, symbol: 'C', nameId: 'Karbon', nameLatin: 'Carbon',
    atomicMass: 12.0110, electronConfig: '[He] 2s2 2p2', category: 'Nonlogam', period: 2, group: 14,
    description: 'Tulang punggung semua organisme hidup.',
    uses: 'Bahan bakar, pensil, produksi baja.',
    hazardWarning: 'Secara umum aman, debu karbon dapat mengiritasi.',
  },
  {
    atomicNumber: 7, symbol: 'N', nameId: 'Nitrogen', nameLatin: 'Nitrogen',
    atomicMass: 14.0070, electronConfig: '[He] 2s2 2p3', category: 'Nonlogam', period: 2, group: 15,
    description: 'Gas nonlogam yang membentuk 78% atmosfer Bumi.',
    uses: 'Pupuk, pelunak, pengawet makanan.',
    hazardWarning: 'Asfeksi dalam ruangan tertutup.',
  },
  {
    atomicNumber: 8, symbol: 'O', nameId: 'Oksigen', nameLatin: 'Oxygen',
    atomicMass: 15.9990, electronConfig: '[He] 2s2 2p4', category: 'Nonlogam', period: 2, group: 16,
    description: 'Pernapasan bagi sebagian besar makhluk hidup.',
    uses: 'Pernapasan medis, pembakaran, pemurnian air.',
    hazardWarning: 'Mendukung pembakaran, risiko kebakaran dalam konsentrasi tinggi.',
  },
  {
    atomicNumber: 9, symbol: 'F', nameId: 'Fluor', nameLatin: 'Fluorine',
    atomicMass: 18.9980, electronConfig: '[He] 2s2 2p5', category: 'Halogen', period: 2, group: 17,
    description: 'Elemen paling elektronegatif dan reaktif.',
    uses: 'Pasta gigi, pengukuran uranium, fluorkarbon.',
    hazardWarning: 'Sangat beracun dan korosif.',
  },
  {
    atomicNumber: 10, symbol: 'Ne', nameId: 'Neon', nameLatin: 'Neon',
    atomicMass: 20.1800, electronConfig: '[He] 2s2 2p6', category: 'Gas Mulia', period: 2, group: 18,
    description: 'Gas mulia yang menghasilkan cahaya merah oranye saat dienergikan.',
    uses: 'Lampu neon, indikator listrik.',
    hazardWarning: 'Asfeksi dalam ruangan tertutup.',
  },
  {
    atomicNumber: 11, symbol: 'Na', nameId: 'Natrium', nameLatin: 'Sodium',
    atomicMass: 22.9900, electronConfig: '[Ne] 3s1', category: 'Logam Alkali', period: 3, group: 1,
    description: 'Logam alkali yang lunak, reaktif dengan air.',
    uses: 'Garam dapur, lampu natrium, perapian.',
    hazardWarning: 'Mereaksi keras dengan air, korosif.',
  },
  {
    atomicNumber: 12, symbol: 'Mg', nameId: 'Magnesium', nameLatin: 'Magnesium',
    atomicMass: 24.3050, electronConfig: '[Ne] 3s2', category: 'Logam Alkaline Tanah', period: 3, group: 2,
    description: 'Logam ringan yang sering digunakan dalam alloy.',
    uses: 'Alloy pesawat, obat antasida, pelapik.',
    hazardWarning: 'Mudah terbakar dalam bentuk serbuk.',
  },
  {
    atomicNumber: 13, symbol: 'Al', nameId: 'Aluminium', nameLatin: 'Aluminium',
    atomicMass: 26.9820, electronConfig: '[Ne] 3s2 3p1', category: 'Logam Lemah', period: 3, group: 13,
    description: 'Logam ringan, korosi tahan, melimpah di kerak bumi.',
    uses: 'Kemasan, konstruksi, penerbangan, kaleng.',
    hazardWarning: 'Secara umum aman.',
  },
  {
    atomicNumber: 14, symbol: 'Si', nameId: 'Silikon', nameLatin: 'Silicon',
    atomicMass: 28.0850, electronConfig: '[Ne] 3s2 3p2', category: 'Metaloid', period: 3, group: 14,
    description: 'Dasar semiconductor dan elektronik modern.',
    uses: 'Chip komputer, pemana, solar panel.',
    hazardWarning: 'Debu silikon dapat mengiritasi paru-paru.',
  },
  {
    atomicNumber: 15, symbol: 'P', nameId: 'Fosfor', nameLatin: 'Phosphorus',
    atomicMass: 30.9740, electronConfig: '[Ne] 3s2 3p3', category: 'Nonlogam', period: 3, group: 15,
    description: 'Nonlogam yang esensial bagi DNA dan ATP.',
    uses: 'Pupuk, korek api, deterjen.',
    hazardWarning: 'Fosfor putih mudah terbakar secara spontan.',
  },
  {
    atomicNumber: 16, symbol: 'S', nameId: 'Sulfur', nameLatin: 'Sulfur',
    atomicMass: 32.0600, electronConfig: '[Ne] 3s2 3p4', category: 'Nonlogam', period: 3, group: 16,
    description: 'Nonlogam kuning yang berbau busuk.',
    uses: 'Pupuk, vulkanisasi karet, obat kulit.',
    hazardWarning: 'Dioksida sulfur merupakan polutan udara.',
  },
  {
    atomicNumber: 17, symbol: 'Cl', nameId: 'Klorin', nameLatin: 'Chlorine',
    atomicMass: 35.4500, electronConfig: '[Ne] 3s2 3p5', category: 'Halogen', period: 3, group: 17,
    description: 'Halogen yang berwarna hijau keuningan, sangat reaktif.',
    uses: 'Pengasinan air, pelumas, produk kebersihan.',
    hazardWarning: 'Beracun, iritasi paruh-parna parah.',
  },
  {
    atomicNumber: 18, symbol: 'Ar', nameId: 'Argon', nameLatin: 'Argon',
    atomicMass: 39.9480, electronConfig: '[Ne] 3s2 3p6', category: 'Gas Mulia', period: 3, group: 18,
    description: 'Gas mulia yang inerte, melindungi proses las.',
    uses: 'Lampu listrik, las, pelindung logam.',
    hazardWarning: 'Asfeksi dalam ruangan tertutup.',
  },
  {
    atomicNumber: 19, symbol: 'K', nameId: 'Kalium', nameLatin: 'Kalium',
    atomicMass: 39.0980, electronConfig: '[Ar] 4s1', category: 'Logam Alkali', period: 4, group: 1,
    description: 'Logam alkali yang penting bagi sel tumbuhan dan hewan.',
    uses: 'Pupuk, obat jantung, sabun.',
    hazardWarning: 'Mereaksi keras dengan air, korosif.',
  },
  {
    atomicNumber: 20, symbol: 'Ca', nameId: 'Kalsium', nameLatin: 'Calcium',
    atomicMass: 40.0780, electronConfig: '[Ar] 4s2', category: 'Logam Alkaline Tanah', period: 4, group: 2,
    description: 'Esensial bagi tulang dan gigi hewan.',
    uses: 'Semen, produk susu, alloy.',
    hazardWarning: 'Reaktif dengan air, dapat menyebabkan iritasi.',
  },
  {
    atomicNumber: 26, symbol: 'Fe', nameId: 'Besi', nameLatin: 'Ferrum',
    atomicMass: 55.8450, electronConfig: '[Ar] 3d6 4s2', category: 'Logam Transisi', period: 4, group: 8,
    description: 'Logam transisi yang paling banyak digunakan dan melimpah.',
    uses: 'Konstruksi, mobil, baja, hemoglobin.',
    hazardWarning: 'Secara umum aman, dapat berekor.',
  },
  {
    atomicNumber: 29, symbol: 'Cu', nameId: 'Tembaga', nameLatin: 'Cuprum',
    atomicMass: 63.5460, electronConfig: '[Ar] 3d10 4s1', category: 'Logam Transisi', period: 4, group: 11,
    description: 'Pengkonduksi listrik dan panas yang baik.',
    uses: 'Kabel listrik, plomberie, koin.',
    hazardWarning: 'Secara umum aman, dosis tinggi dapat beracun.',
  },
  {
    atomicNumber: 47, symbol: 'Ag', nameId: 'Perak', nameLatin: 'Argentum',
    atomicMass: 107.8680, electronConfig: '[Kr] 4d10 5s1', category: 'Logam Transisi', period: 5, group: 11,
    description: 'Logam mulia dengan konduktivitas listrik tertinggi.',
    uses: 'Perhiasan, fotografi, kontak listrik.',
    hazardWarning: 'Secara umum aman.',
  },
  {
    atomicNumber: 79, symbol: 'Au', nameId: 'Emas', nameLatin: 'Aurum',
    atomicMass: 196.9670, electronConfig: '[Xe] 4f14 5d10 6s1', category: 'Logam Transisi', period: 6, group: 11,
    description: 'Logam mulia yang tidak berekor dan bernilai tinggi.',
    uses: 'Perhiasan, uang, elektronik.',
    hazardWarning: 'Secara umum aman.',
  },
  {
    atomicNumber: 82, symbol: 'Pb', nameId: 'Timbal', nameLatin: 'Plumbum',
    atomicMass: 207.2000, electronConfig: '[Xe] 4f14 5d10 6s2 6p2', category: 'Logam Lemah', period: 6, group: 14,
    description: 'Logam lemah yang padat dan berekor.',
    uses: 'Aku, pelindung radiasi, baterai.',
    hazardWarning: 'Sangat beracun, terutama bagi anak-anak.',
  },
]

const ions = [
  { name: 'Hidroksida', formula: 'OH⁻', charge: '-1' },
  { name: 'Sulfat', formula: 'SO₄²⁻', charge: '-2' },
  { name: 'Karbonat', formula: 'CO₃²⁻', charge: '-2' },
  { name: 'Nitrat', formula: 'NO₃⁻', charge: '-1' },
  { name: 'Fosfat', formula: 'PO₄³⁻', charge: '-3' },
  { name: 'Amonium', formula: 'NH₄⁺', charge: '+1' },
  { name: 'Asetat', formula: 'CH₃COO⁻', charge: '-1' },
  { name: 'Nitrit', formula: 'NO₂⁻', charge: '-1' },
  { name: 'Sulfita', formula: 'SO₃²⁻', charge: '-2' },
  { name: 'Perklorat', formula: 'ClO₄⁻', charge: '-1' },
]

async function main() {
  console.log('Menghapus data lama...')
  await prisma.element.deleteMany()
  await prisma.polyatomicIon.deleteMany()
  await prisma.category.deleteMany()

  console.log('Membuat kategori...')
  const categoryMap = {}
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat })
    categoryMap[cat.name] = created.id
  }

  console.log('Membuat unsur...')
  for (const el of elements) {
    await prisma.element.create({
      data: {
        atomicNumber: el.atomicNumber,
        symbol: el.symbol,
        nameId: el.nameId,
        nameLatin: el.nameLatin,
        atomicMass: el.atomicMass,
        electronConfig: el.electronConfig,
        period: el.period,
        group: el.group,
        description: el.description,
        uses: el.uses,
        hazardWarning: el.hazardWarning,
        categoryId: categoryMap[el.category],
      },
    })
  }

  console.log('Membuat ion poliatomik...')
  for (const ion of ions) {
    await prisma.polyatomicIon.create({ data: ion })
  }

  console.log('Seed selesai.')
  console.log(`- ${categories.length} kategori`)
  console.log(`- ${elements.length} unsur`)
  console.log(`- ${ions.length} ion poliatomik`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
