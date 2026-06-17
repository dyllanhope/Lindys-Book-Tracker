'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { TAG_CATEGORIES, TAG_CATEGORY_LABEL, TAG_CATEGORY_STYLE } from '@/lib/tags'
import type { Tag } from '@/lib/types'

interface Ratings {
  minRating: number
  minPlot: number
  minCharacters: number
  minWriting: number
  minSpice: number
}

interface Props {
  tags: Tag[]
  activeTagIds: string[]
  ratings: Ratings
  ownedOnly: boolean
  sort: string
}

const RATING_OPTIONS = [0, 1, 2, 3, 4, 5]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'date_added', label: 'Recently added' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
]

const RATING_DIMS: { param: keyof Ratings; label: string; symbol: string }[] = [
  { param: 'minRating', label: 'Overall', symbol: '★' },
  { param: 'minPlot', label: 'Plot', symbol: '★' },
  { param: 'minCharacters', label: 'Characters', symbol: '★' },
  { param: 'minWriting', label: 'Writing', symbol: '★' },
  { param: 'minSpice', label: 'Spice', symbol: '🌶️' },
]

export function LibraryFilters({ tags, activeTagIds, ratings, ownedOnly, sort }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => setMounted(true), [])

  // Lock background scroll + allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const activeTagSet = new Set(activeTagIds)
  const activeRatingCount = RATING_DIMS.filter((d) => ratings[d.param] > 0).length
  const activeCount = activeTagIds.length + activeRatingCount + (ownedOnly ? 1 : 0)

  function push(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(searchParams.toString())
    mutate(p)
    const qs = p.toString()
    router.push(qs ? `/library?${qs}` : '/library')
  }

  function toggleTag(id: string) {
    push((p) => {
      const cur = new Set((p.get('tags') ?? '').split(',').filter(Boolean))
      if (cur.has(id)) cur.delete(id)
      else cur.add(id)
      if (cur.size) p.set('tags', [...cur].join(','))
      else p.delete('tags')
    })
  }

  function setRating(param: keyof Ratings, n: number) {
    push((p) => {
      if (n > 0) p.set(param, String(n))
      else p.delete(param)
    })
  }

  function setSort(value: string) {
    push((p) => {
      if (value && value !== 'date_added') p.set('sort', value)
      else p.delete('sort')
    })
  }

  function toggleOwned() {
    push((p) => {
      if (ownedOnly) p.delete('owned')
      else p.set('owned', '1')
    })
  }

  function clearAll() {
    push((p) => {
      p.delete('tags')
      p.delete('owned')
      for (const d of RATING_DIMS) p.delete(d.param)
    })
  }

  const grouped = TAG_CATEGORIES
    .map((cat) => ({
      ...cat,
      tags: tags
        .filter((t) => t.category === cat.value)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    }))
    .filter((g) => g.tags.length > 0)

  const activeTags = activeTagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is Tag => !!t)

  // Shared accordion content, rendered inline on desktop and in the drawer on mobile.
  const filterSections = (
    <>
      {/* Sort */}
      <Accordion title="Sort" defaultOpen={sort !== 'date_added'}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {SORT_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setSort(o.value)} style={chipStyle(sort === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </Accordion>

      {/* Ratings — overall + per dimension */}
      <Accordion title="Ratings" badge={activeRatingCount} defaultOpen={activeRatingCount > 0}>
        <div style={{ fontSize: 11.5, color: 'var(--ink-light)', marginBottom: 10 }}>Minimum rating (& up)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {RATING_DIMS.map((d) => (
            <div key={d.param} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#7a6a5e', fontWeight: 600, width: 92, flexShrink: 0 }}>{d.label}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {RATING_OPTIONS.map((n) => {
                  const active = ratings[d.param] === n
                  return (
                    <button key={n} onClick={() => setRating(d.param, n)} style={ratingChipStyle(active)}>
                      {n === 0 ? 'Any' : `${n}${d.symbol}`}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Owned */}
      <Accordion title="Ownership" badge={ownedOnly ? 1 : 0} defaultOpen={ownedOnly}>
        <button onClick={toggleOwned} style={chipStyle(ownedOnly)}>On my shelf</button>
      </Accordion>

      {/* Tags by category */}
      {grouped.length === 0 ? (
        <Accordion title="Tags" defaultOpen={false}>
          <p style={{ fontSize: 13, color: 'var(--ink-light)', margin: 0 }}>
            No tags yet — add genres and tags from a book&apos;s page.
          </p>
        </Accordion>
      ) : (
        grouped.map((group) => {
          const activeInGroup = group.tags.filter((t) => activeTagSet.has(t.id)).length
          return (
            <Accordion key={group.value} title={TAG_CATEGORY_LABEL[group.value]} badge={activeInGroup} defaultOpen={activeInGroup > 0}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {group.tags.map((t) => {
                  const active = activeTagSet.has(t.id)
                  const s = TAG_CATEGORY_STYLE[t.category]
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.id)}
                      style={{ padding: '7px 13px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif', background: active ? s.bg : 'transparent', color: active ? s.fg : 'var(--ink-light)', border: `1px solid ${active ? s.border : 'rgba(150,130,110,0.18)'}` }}
                    >
                      {t.name}
                    </button>
                  )
                })}
              </div>
            </Accordion>
          )
        })
      )}
    </>
  )

  return (
    <div style={{ marginTop: 16 }}>
      {/* Toggle + active chips row */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: open || activeCount > 0 ? 'var(--ink)' : 'var(--card)', color: open || activeCount > 0 ? 'var(--cream)' : '#7a6a5e', border: `1px solid ${open || activeCount > 0 ? 'var(--ink)' : 'rgba(150,130,110,0.16)'}`, fontFamily: 'var(--font-mulish), sans-serif' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
        </button>

        {/* Active rating chips */}
        {RATING_DIMS.filter((d) => ratings[d.param] > 0).map((d) => (
          <FilterPill key={d.param} label={`${d.label} ${ratings[d.param]}${d.symbol}+`} onRemove={() => setRating(d.param, 0)} />
        ))}
        {ownedOnly && <FilterPill label="On my shelf" onRemove={toggleOwned} />}
        {activeTags.map((t) => (
          <FilterPill key={t.id} label={t.name} color={TAG_CATEGORY_STYLE[t.category]} onRemove={() => toggleTag(t.id)} />
        ))}
        {activeCount > 0 && (
          <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', fontFamily: 'var(--font-mulish), sans-serif' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Slide-out drawer with backdrop, on all viewports. Portaled to <body> so
          it escapes the library page's transformed (fade-up) stacking context and
          renders above the bottom nav. */}
      {mounted && createPortal(
      <div>
        {/* Backdrop */}
        <div
          onClick={close}
          aria-hidden
          style={{ position: 'fixed', inset: 0, background: 'rgba(54,42,32,0.42)', zIndex: 60, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .25s ease' }}
        />
        {/* Panel */}
        <div
          role="dialog"
          aria-label="Filters"
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '86%', maxWidth: 360, zIndex: 61,
            background: 'var(--cream)', boxShadow: '-16px 0 44px -16px rgba(90,72,55,0.5)',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(150,130,110,0.14)' }}>
            <span style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>
              Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
            </span>
            <button onClick={close} aria-label="Close filters" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 99, background: 'var(--card)', border: '1px solid rgba(150,130,110,0.18)', color: 'var(--ink)', cursor: 'pointer', padding: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Scrollable accordion body */}
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
            {filterSections}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid rgba(150,130,110,0.14)' }}>
            <button
              onClick={clearAll}
              disabled={activeCount === 0}
              style={{ flex: '0 0 auto', padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'transparent', color: activeCount === 0 ? 'rgba(150,130,110,0.5)' : 'var(--ink-light)', border: '1px solid rgba(150,130,110,0.2)', cursor: activeCount === 0 ? 'default' : 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}
            >
              Clear all
            </button>
            <button
              onClick={close}
              style={{ flex: 1, padding: '12px 18px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}
            >
              Show results
            </button>
          </div>
        </div>
      </div>,
      document.body,
      )}
    </div>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 13px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-mulish), sans-serif',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--cream)' : 'var(--ink-light)',
    border: `1px solid ${active ? 'var(--ink)' : 'rgba(150,130,110,0.18)'}`,
  }
}

function ratingChipStyle(active: boolean): React.CSSProperties {
  return {
    minWidth: 38, padding: '6px 10px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-mulish), sans-serif', textAlign: 'center',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--cream)' : 'var(--ink-light)',
    border: `1px solid ${active ? 'var(--ink)' : 'rgba(150,130,110,0.18)'}`,
  }
}

function Accordion({ title, badge = 0, defaultOpen = false, children }: { title: string; badge?: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderTop: '1px solid rgba(150,130,110,0.12)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#A8978A', fontWeight: 700 }}>
          {title}
          {badge > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 17, height: 17, padding: '0 5px', borderRadius: 99, background: 'var(--ink)', color: 'var(--cream)', fontSize: 10, fontWeight: 700, letterSpacing: 0 }}>{badge}</span>
          )}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8978A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  )
}

function FilterPill({ label, color, onRemove }: { label: string; color?: { bg: string; fg: string; border: string }; onRemove: () => void }) {
  const bg = color?.bg ?? '#F0E8D8'
  const fg = color?.fg ?? '#7a6a5e'
  const border = color?.border ?? 'rgba(150,130,110,0.3)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: bg, color: fg, border: `1px solid ${border}` }}>
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 99, border: 'none', background: 'rgba(0,0,0,0.06)', color: fg, cursor: 'pointer', padding: 0 }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </span>
  )
}
