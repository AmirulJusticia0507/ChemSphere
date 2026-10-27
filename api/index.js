// Vercel Serverless Function entry point
// Wraps the Express app for serverless deployment

import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env from backend directory (for local dev)
try {
  const dotenvPath = pathToFileURL(join(__dirname, '..', 'backend', 'node_modules', 'dotenv', 'dist', 'index.cjs')).href
  const dotenv = await import(dotenvPath)
  dotenv.config({ path: join(__dirname, '..', 'backend', '.env') })
} catch {
  // dotenv not available (Vercel provides env vars directly)
}

const appPath = pathToFileURL(join(__dirname, '..', 'backend', 'src', 'app.js')).href
const { default: app } = await import(appPath)

export default app
