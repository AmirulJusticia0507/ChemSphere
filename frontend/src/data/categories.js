const fallback = {
  background: '#eef2f7',
  foreground: '#475569',
  dot: '#94a3b8',
}

export const categoryStyles = {
  'logam alkali': { background: '#ffe0d6', foreground: '#9a3412', dot: '#f97316' },
  'logam alkaline tanah': { background: '#fef3c7', foreground: '#92400e', dot: '#f59e0b' },
  'logam alkali tanah': { background: '#fef3c7', foreground: '#92400e', dot: '#f59e0b' },
  'logam transisi': { background: '#dbeafe', foreground: '#1e40af', dot: '#3b82f6' },
  'logam lemah': { background: '#e2e8f0', foreground: '#334155', dot: '#64748b' },
  'logam pasca-transisi': { background: '#e2e8f0', foreground: '#334155', dot: '#64748b' },
  metaloid: { background: '#dcfce7', foreground: '#166534', dot: '#22c55e' },
  nonlogam: { background: '#d9f99d', foreground: '#3f6212', dot: '#84cc16' },
  halogen: { background: '#fef08a', foreground: '#854d0e', dot: '#eab308' },
  'gas mulia': { background: '#ede9fe', foreground: '#5b21b6', dot: '#8b5cf6' },
  lantanida: { background: '#fce7f3', foreground: '#9d174d', dot: '#ec4899' },
  aktinida: { background: '#ffedd5', foreground: '#7c2d12', dot: '#ea580c' },
}

export function styleForCategory(name) {
  return categoryStyles[String(name ?? '').toLowerCase()] ?? fallback
}

export function isLanthanide(atomicNumber) {
  return atomicNumber >= 57 && atomicNumber <= 71
}

export function isActinide(atomicNumber) {
  return atomicNumber >= 89 && atomicNumber <= 103
}

export function isFBlock(element) {
  return isLanthanide(element.atomicNumber) || isActinide(element.atomicNumber)
}
