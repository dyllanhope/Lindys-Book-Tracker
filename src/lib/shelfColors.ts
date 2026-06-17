// Curated warm-linen-friendly palette for shelves.
export const SHELF_COLORS = [
  '#C9845A', // terracotta
  '#7B966B', // sage
  '#8878A8', // plum
  '#C9A18A', // clay (default)
  '#5B8A8A', // teal
  '#B5894A', // amber
  '#A8678A', // rose
  '#6E7FA8', // blue
]

export const DEFAULT_SHELF_COLOR = '#C9A18A'

/** rgba() string from a #rrggbb hex with the given alpha. */
export function hexToRgba(hex: string, alpha = 1): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return `rgba(201,161,138,${alpha})` // fall back to clay
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}
