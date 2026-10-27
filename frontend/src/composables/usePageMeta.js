import { onUnmounted, watchEffect } from 'vue'

const SITE_NAME = 'ChemSphere'
const DEFAULT_DESCRIPTION =
  'Tabel periodik interaktif Bahasa Indonesia dengan 118 unsur, ion poliatomik, kalkulator kimia, dan kuis latihan.'

function setMeta(selector, attribute, value) {
  if (!value) return
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    const [attr, name] = selector.replace(/^meta\[|\]$/g, '').split('=')
    tag.setAttribute(attr, name.replace(/["']/g, ''))
    document.head.appendChild(tag)
  }
  tag.setAttribute(attribute, value)
}

// Menyisipkan atau memperbarui satu blok JSON-LD terstruktur di <head>.
// Satu halaman hanya boleh punya satu node dengan key tertentu.
function setJsonLd(key, data) {
  const id = `jsonld-${key}`
  let tag = document.getElementById(id)
  if (!tag) {
    tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.id = id
    document.head.appendChild(tag)
  }
  tag.textContent = JSON.stringify(data)
}

/**
 * Mengatur judul, meta deskripsi, dan (opsional) JSON-LD halaman.
 * Nilai dikembalikan ke default saat komponen dilepas.
 *
 * @param {() => { title?: string, description?: string, image?: string, jsonLd?: object }} getter
 */
export function usePageMeta(getter) {
  const previousTitle = document.title

  watchEffect(() => {
    const { title, description, image, jsonLd } = getter() ?? {}
    document.title = title ? `${title} | ${SITE_NAME}` : previousTitle

    const desc = description ?? DEFAULT_DESCRIPTION
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', title ? `${title} | ${SITE_NAME}` : SITE_NAME)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[name="twitter:title"]', 'content', title ? `${title} | ${SITE_NAME}` : SITE_NAME)
    setMeta('meta[name="twitter:description"]', 'content', desc)
    if (image) {
      setMeta('meta[property="og:image"]', 'content', image)
      setMeta('meta[name="twitter:image"]', 'content', image)
    }
    if (jsonLd) setJsonLd(title ? title : 'page', jsonLd)
  })

  onUnmounted(() => {
    document.title = previousTitle
  })
}

export { DEFAULT_DESCRIPTION, SITE_NAME }
