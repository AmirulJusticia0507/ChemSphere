import { AppError } from '../middlewares/errorHandler.js'

// Menerjemahkan error Prisma yang umum menjadi respons HTTP yang masuk akal,
// supaya pesan internal database tidak bocor ke client.
export function translatePrismaError(error) {
  if (error?.code === 'P2025') {
    return new AppError(404, 'Data tidak ditemukan')
  }
  if (error?.code === 'P2002') {
    const field = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'nilai unik'
    return new AppError(409, `Data dengan ${field} tersebut sudah ada`)
  }
  if (error?.code === 'P2003') {
    return new AppError(409, 'Data masih direferensikan oleh record lain')
  }
  if (error?.code === 'P2000') {
    return new AppError(400, 'Nilai yang dikirim terlalu panjang')
  }
  return error
}

export function toAppError(error) {
  const translated = translatePrismaError(error)
  if (translated instanceof AppError) return translated
  return new AppError(500, 'Terjadi kesalahan pada server. Silakan coba lagi.')
}
