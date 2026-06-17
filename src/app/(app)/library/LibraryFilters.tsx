'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TAG_CATEGORIES, TAG_CATEGORY_LABEL, TAG_CATEGORY_STYLE } from '@/lib/tags'
import type { Tag } from '@/lib/types'

interface Props {
  tags: Tag[]
  activeTagIds: string[]
  minRating: number
  ownedOnly: boolean
}

const RATING_OPTIONS = [0, 1, 2, 3, 4, 5]

export function LibraryFilters({ tags, activeTagIds, minRating, ownedOnly }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const activeTagSet = new Set(activeTagIds)
  const activeCount = activeTagIds.length + (minRating > 0 ? 1 : 0) + (ownedOnly ? 1 : 0)

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

  function setMinRating(n: number) {
    push((p) => {
      if (n > 0) p.set('minRating', String(n))
      else p.delete('minRating')
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
      p.delete('minRating')
      p.delete('owned')
    })
  }

  // Tags grouped by category (only categories that have tags).
  const grouped = TAG_CATEGORIES
    .map((cat) => ({ ...cat, tags: tags.filter((t) => t.category === cat.value) }))
    .filter((g) => g.tags.length > 0)

  const activeTags = activeTagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is Tag => !!t)

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

        {/* Active filter chips */}
        {minRating > 0 && (
          <FilterPill label={`${minRating}★ & up`} onRemove={() => setMinRating(0)} />
        )}
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

      {/* Expandable panel */}
      {open && (
        <div style={{ marginTop: 12, background: 'var(--card)', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(150,130,110,0.12)' }}>
          {/* Minimum rating */}
          <FilterSection title="Minimum rating">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {RATING_OPTIONS.map((n) => {
                const active = minRating === n
                return (
                  <button key={n} onClick={() => setMinRating(n)} style={chipStyle(active)}>
                    {n === 0 ? 'Any' : `${n}★+`}
                  </button>
                )
              })}
            </div>
          </FilterSection>

          {/* Owned */}
          <FilterSection title="Ownership">
            <button onClick={toggleOwned} style={chipStyle(ownedOnly)}>On my shelf</button>
          </FilterSection>

          {/* Tags by category */}
          {grouped.length === 0 ? (
            <FilterSection title="Tags">
              <p style={{ fontSize: 13, color: 'var(--ink-light)', margin: 0 }}>
                No tags yet — add genres and tags from a book&apos;s page.
              </p>
            </FilterSection>
          ) : (
            grouped.map((group) => (
              <FilterSection key={group.value} title={TAG_CATEGORY_LABEL[group.value]}>
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
              </FilterSection>
            ))
          )}
        </div>
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#A8978A', fontWeight: 700, marginBottom: 9 }}>{title}</div>
      {children}
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
