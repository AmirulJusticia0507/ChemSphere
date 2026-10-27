// Vercel Serverless Function entry point (repo root -> /api)
// Wraps the Express app from backend/ for serverless deployment.

import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// On Vercel env vars are injected directly. Locally, load backend/.env.
if (!process.env.VERCEL) {
  try {
    const dotenvPath = pathToFileURL(
      join(rootDir, 'backend', 'node_modules', 'dotenv', 'dist', 'index.cjs'),
    ).href
    const dotenv = await import(dotenvPath)
    dotenv.config({ path: join(rootDir, 'backend', '.env') })
  } catch {
    // dotenv not installed locally; ignore
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function initError(err) {
  console.error('[chemsphere] bootstrap failed:', err)
  return (req, res) =>
    sendJson(res, 500, {
      success: false,
      message: 'Function bootstrap failed',
      error: err?.message ?? String(err),
      stack: String(err?.stack ?? '').split('\n').slice(0, 12),
    })
}

// Vercel rewrites every API path to /api, but Express routes are mounted under
// /api/v1 and /health, so the original path is restored from the rewrite headers.
function restorePath(req) {
  const original =
    req.headers['x-vercel-original-path'] ||
    req.headers['x-original-url'] ||
    req.headers['x-rewrite-url'] ||
    (typeof req.headers['x-forwarded-uri'] === 'string' ? req.headers['x-forwarded-uri'] : '')

  if (typeof original === 'string' && original.startsWith('/') && original !== '/api') {
    req.url = original
  }
}

let handler
try {
  const appPath = pathToFileURL(join(rootDir, 'backend', 'src', 'app.js')).href
  const mod = await import(appPath)
  const app = mod.default ?? mod.app
  if (typeof app !== 'function') throw new Error('backend app export is not a function')

  handler = (req, res) => {
    restorePath(req)
    return app(req, res)
  }
} catch (err) {
  handler = initError(err)
}

export default handler
