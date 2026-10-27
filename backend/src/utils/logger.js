import crypto from 'crypto'

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }
const threshold = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info

function write(level, message, meta) {
  if (LEVELS[level] < threshold) return
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta && Object.keys(meta).length ? meta : {}),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (message, meta) => write('debug', message, meta),
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
}

// Memberi setiap request sebuah id agar log satu permintaan bisa dirangkai.
export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID()
  res.setHeader('X-Request-Id', req.id)
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    write(level, 'request', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    })
  })

  next()
}
