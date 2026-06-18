import { coverColors } from '@/lib/coverGradient'

/** Max number of spines we draw on a shelf card before we stop adding visuals. */
export const SHELF_SPINE_CAP = 12

/** Deterministic 32-bit hash of a string (same scheme as coverGradient). */
function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) >>> 0
  return h
}

/**
 * A little row of book spines for a shelf card — one spine per book, each a
 * different pastel and a deterministic varying height (so a shelf looks like a
 * real, slightly uneven row of books). Capped at {@link SHELF_SPINE_CAP}; any
 * books beyond that simply aren't drawn (the count label still reflects the total).
 */
export function ShelfSpines({ bookIds, height = 52 }: { bookIds: string[]; height?: number }) {
  const shown = bookIds.slice(0, SHELF_SPINE_CAP)

  if (shown.length === 0) {
    // Empty shelf: a couple of faint ghost spines so the card still reads as a shelf.
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
        {[0.7, 0.85, 0.6].map((f, i) => (
          <div key={i} style={{ width: 8, height: Math.round(height * f), borderRadius: '2px 2px 1px 1px', background: 'rgba(150,130,110,0.12)' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {shown.map((id) => {
        const h = hash(id)
        const factor = 0.58 + (h % 43) / 100 // 0.58–1.00 of full height
        const width = 7 + (h % 3) // 7–9px
        const { c1, c2 } = coverColors(id)
        return (
          <div
            key={id}
            style={{
              width,
              height: Math.round(height * factor),
              borderRadius: '2px 2px 1px 1px',
              background: `linear-gradient(175deg, ${c1}, ${c2})`,
              boxShadow: 'inset -1.5px 0 rgba(90,72,55,0.06), 0 1px 2px -1px rgba(90,72,55,0.25)',
            }}
          />
        )
      })}
    </div>
  )
}
