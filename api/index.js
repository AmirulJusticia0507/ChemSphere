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

function initError(err) {
  console.error('[chemsphere] bootstrap failed:', err)
  return (req, res) => {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(
      JSON.stringify({
        success: false,
        message: 'Function bootstrap failed',
        error: err?.message ?? String(err),
        stack: String(err?.stack ?? '').split('\n').slice(0, 12),
      }),
    )
  }
}

let handler
try {
  const appPath = pathToFileURL(join(rootDir, 'backend', 'src', 'app.js')).href
  const mod = await import(appPath)
  handler = mod.default ?? mod.app
  if (typeof handler !== 'function') {
    throw new Error('backend app export is not a function')
  }
} catch (err) {
  handler = initError(err)
}

export default handler
