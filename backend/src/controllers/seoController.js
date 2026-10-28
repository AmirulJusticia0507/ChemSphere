import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { asyncHandler } from '../middlewares/errorHandler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Basis URL publik. Di produksi isi SITE_URL; fallback ke APP_URL.
function siteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.APP_URL ||
    'https://chemsphere-app.vercel.app'
  ).replace(/\/$/, '')
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Sitemap dinamis: halaman statis ditambah satu entri per unsur.
export const getSitemap = asyncHandler(async (_req, res) => {
  const base = siteUrl()

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/tabel', priority: '0.9', changefreq: 'weekly' },
    { path: '/eksperimen', priority: '0.7', changefreq: 'monthly' },
    { path: '/kalkulator', priority: '0.8', changefreq: 'monthly' },
    { path: '/kuis', priority: '0.6', changefreq: 'monthly' },
  ]

  let elements = []
  try {
    const prisma = (await import('../config/db.js')).default
    elements = await prisma.element.findMany({ select: { id: true, updatedAt: true } })
  } catch {
    // Bila database tidak tersedia, sitemap tetap berisi halaman statis.
    elements = []
  }

  const urls = [
    ...staticPages.map(
      (page) => `  <url>
    <loc>${escapeXml(base + page.path)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    ),
    ...elements.map(
      (element) => `  <url>
    <loc>${escapeXml(`${base}/unsur/${element.id}`)}</loc>
    <lastmod>${new Date(element.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ),
  ]

  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`)
})

// robots.txt dilayani dari backend agar Sitemap menunjuk host yang benar.
export const getRobots = asyncHandler(async (_req, res) => {
  const base = siteUrl()
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /masuk
Disallow: /daftar
Disallow: /progres

Sitemap: ${base}/sitemap.xml
`)
})
