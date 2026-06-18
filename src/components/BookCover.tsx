import { coverColors } from '@/lib/coverGradient'

/**
 * A physical-looking book cover, ported from the prototype: a gradient (or the
 * real cover photo layered over it), a glossy "wash" overlay (spine fold, satin
 * sheen, top light, corner vignette, hairline) and a stacked-pages edge. The
 * lift-on-hover lives in the `.book-cover` class in globals.css.
 *
 * When the book has a cover photo we show it; otherwise we paint the gradient
 * placeholder with the genre / title / author, just like the prototype.
 */

// Glossy physical-book overlay (matches prototype's wash()).
const WASH_BG =
  'linear-gradient(90deg, rgba(38,26,18,0.34) 0%, rgba(38,26,18,0.11) 3.5%, rgba(38,26,18,0) 6.5%, rgba(255,255,255,0.26) 7.5%, rgba(255,255,255,0) 12%), ' +
  'linear-gradient(112deg, rgba(255,255,255,0) 39%, rgba(255,255,255,0.34) 47.5%, rgba(255,255,255,0.05) 52%, rgba(255,255,255,0) 60%), ' +
  'radial-gradient(120% 85% at 24% 10%, rgba(255,253,246,0.30) 0%, rgba(255,253,246,0) 44%), ' +
  'radial-gradient(150% 130% at 82% 106%, rgba(38,26,18,0.36) 0%, rgba(38,26,18,0) 52%)'
const WASH_SHADOW =
  'inset 0 0 0 1px rgba(255,253,246,0.22), inset -7px 0 13px -10px rgba(0,0,0,0.35), inset 9px 0 11px -11px rgba(0,0,0,0.32)'

interface Props {
  book: Pick<import('@/lib/types').Book, 'id' | 'title' | 'author' | 'cover_url'>
  genre?: string
  radius?: number
  padding?: string
  /** Overlays (e.g. a status badge); position them absolutely from the caller. */
  children?: React.ReactNode
}

export function BookCover({ book, genre, radius = 14, padding = '14px 13px', children }: Props) {
  const { c1, c2 } = coverColors(book.id)
  const gradient = `linear-gradient(155deg, ${c1} 0%, ${c2} 70%, ${c1} 140%)`
  const hasImg = Boolean(book.cover_url)
  const background = hasImg ? `url('${book.cover_url}') center / cover no-repeat, ${gradient}` : gradient

  return (
    <div
      className="book-cover"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: radius,
        overflow: 'hidden',
        background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit', background: WASH_BG, boxShadow: WASH_SHADOW }} />

      {!hasImg && (
        <>
          <div style={{ position: 'relative', fontSize: 7.5, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(74,61,53,0.5)', fontWeight: 700, minHeight: 9 }}>
            {genre ?? ''}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 16, height: 1.5, background: 'rgba(74,61,53,0.3)', borderRadius: 2, marginBottom: 6 }} />
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 14.5, lineHeight: 1.1, color: '#3a2e27', fontWeight: 600 }}>{book.title}</div>
            {book.author && <div style={{ fontSize: 8, color: 'rgba(74,61,53,0.6)', marginTop: 4, fontStyle: 'italic' }}>{book.author}</div>}
          </div>
        </>
      )}

      {children}
    </div>
  )
}
