import { logger } from './logger.js'

// Titik integrasi untuk layanan pelaporan error (Sentry, Rollbar, dsb).
// Tanpa DSN, error tetap tercatat di log terstruktur. Dengan DSN, hook ini
// memanggil endpoint intake secara best-effort tanpa memblokir respons.
//
// Konfigurasi:
//   ERROR_REPORTING_URL   endpoint HTTP yang menerima POST JSON
//   ERROR_REPORTING_TOKEN opsional, dikirim sebagai Bearer token

const endpoint = process.env.ERROR_REPORTING_URL ?? ''
const token = process.env.ERROR_REPORTING_TOKEN ?? ''
const enabled = Boolean(endpoint)

// Membatasi jumlah laporan agar kegagalan beruntun tidak membanjiri jaringan.
const MAX_PER_MINUTE = 20
let windowStart = Date.now()
let sentInWindow = 0

function withinBudget() {
  const now = Date.now()
  if (now - windowStart > 60_000) {
    windowStart = now
    sentInWindow = 0
  }
  if (sentInWindow >= MAX_PER_MINUTE) return false
  sentInWindow += 1
  return true
}

export function reportError(error, context = {}) {
  const payload = {
    service: 'chemsphere-api',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
    error: {
      name: error?.name ?? 'Error',
      message: error?.message ?? String(error),
      stack: String(error?.stack ?? '').split('\n').slice(0, 15).join('\n'),
    },
    context,
  }

  if (!enabled) {
    logger.debug('error reporting disabled, skipping', { requestId: context.requestId })
    return
  }

  if (!withinBudget()) {
    logger.warn('error reporting rate limit reached', { requestId: context.requestId })
    return
  }

  // Fire-and-forget: kegagalan pelaporan tidak boleh menggagalkan request.
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).catch((reportingError) => {
    logger.warn('error reporting failed', { message: reportingError?.message })
  })
}

export const errorReportingEnabled = enabled
