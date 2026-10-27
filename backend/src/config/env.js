import 'dotenv/config'

function required(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Environment variable ${name} wajib diisi. Salin .env.example ke .env.`)
  }

  return value
}

const port = Number(process.env.PORT ?? 5000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Environment variable PORT harus berupa angka 1-65535.')
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
}

export default env
