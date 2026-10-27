import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { asyncHandler } from '../middlewares/errorHandler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const specPath = join(__dirname, '..', '..', '..', 'docs', 'openapi.json')

let cached = null

// Menyajikan spesifikasi OpenAPI. Di Vercel file ikut disertakan lewat
// includeFiles pada vercel.json; bila tidak ada, endpoint mengembalikan 404
// dengan pesan yang jelas alih-alih error 500.
export const getOpenApiSpec = asyncHandler(async (_req, res) => {
  if (!cached) {
    try {
      cached = JSON.parse(await readFile(specPath, 'utf8'))
    } catch {
      return res.status(404).json({
        message: 'Spesifikasi OpenAPI tidak tersedia pada deployment ini',
      })
    }
  }
  res.json(cached)
})

// Halaman HTML sederhana untuk membaca dokumentasi tanpa alat tambahan.
export const getApiDocsPage = asyncHandler(async (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ChemSphere API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>body{margin:0;background:#faf9f6}</style>
</head>
<body>
  <div id="swagger"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      })
    }
  </script>
</body>
</html>`)
})
