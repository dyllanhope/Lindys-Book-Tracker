import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { coverGradient } from '@/lib/coverGradient'
import { bookIdsForTagGroups } from '@/lib/tags'
import { LibraryFilters } from './LibraryFilters'
import type { Book, ReadingStatus, Tag } from '@/lib/types'

const STATUS_CHIPS = [
  { value: '', label: 'All' },
  { value: 'currently_reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'not_started', label: 'Want to read' },
  { value: 'did_not_finish', label: 'Did not finish' },
]

interface SearchParams {
  status?: string; sort?: string; owned?: string; tags?: string
  minRating?: string; minPlot?: string; minCharacters?: string; minWriting?: string; minSpice?: string
}

const QUALITY_CATEGORIES = ['plot', 'characters', 'writing']

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const status = params.status ?? ''
  const sort = params.sort ?? 'date_added'
  const ownedOnly = params.owned === '1'
  const tagIds = params.tags ? params.tags.split(',').filter(Boolean) : []
  const num = (v?: string) => (v ? parseInt(v, 10) || 0 : 0)
  const minRating = num(params.minRating)
  const minPlot = num(params.minPlot)
  const minCharacters = num(params.minCharacters)
  const minWriting = num(params.minWriting)
  const minSpice = num(params.minSpice)

  const supabase = await createClient()

  const { data: allTags } = await supabase.from('tags').select('*').order('name')
  const tags = (allTags ?? []) as Tag[]

  let query = supabase.from('books').select('id, title, author, cover_url, reading_status, owned, date_added')
  if (status) query = query.eq('reading_status', status as ReadingStatus)
  if (ownedOnly) query = query.eq('owned', true)
  const orderCol = sort === 'title' ? 'title' : sort === 'author' ? 'author' : 'date_added'
  query = query.order(orderCol, { ascending: sort !== 'date_added' })
  const { data: rawBooks } = await query
  let books = (rawBooks ?? []) as Book[]

  // Tag filter: OR within a category, AND across categories.
  if (tagIds.length > 0) {
    const byCategory = new Map<string, string[]>()
    for (const id of tagIds) {
      const tag = tags.find((t) => t.id === id)
      if (!tag) continue
      const arr = byCategory.get(tag.category) ?? []
      arr.push(id)
      byCategory.set(tag.category, arr)
    }
    const allowed = await bookIdsForTagGroups(supabase, [...byCategory.values()])
    if (allowed) books = books.filter((b) => allowed.has(b.id))
  }

  // Rating filters: overall (mean of plot/characters/writing) and per-dimension.
  // Each active filter is AND-ed; a book must have a rating in a dimension to pass it.
  if ((minRating || minPlot || minCharacters || minWriting || minSpice) && books.length > 0) {
    const { data: ratingRows } = await supabase
      .from('ratings')
      .select('book_id, category, score')
      .in('book_id', books.map((b) => b.id))
    const byBook = new Map<string, Record<string, number>>()
    for (const r of (ratingRows ?? []) as { book_id: string; category: string; score: number }[]) {
      const m = byBook.get(r.book_id) ?? {}
      m[r.category] = r.score
      byBook.set(r.book_id, m)
    }
    const passesCat = (m: Record<string, number>, cat: string, min: number) =>
      min === 0 || (m[cat] != null && m[cat] >= min)
    books = books.filter((b) => {
      const m = byBook.get(b.id) ?? {}
      if (minRating > 0) {
        const q = QUALITY_CATEGORIES.map((c) => m[c]).filter((s): s is number => s != null)
        if (q.length === 0 || q.reduce((a, c) => a + c, 0) / q.length < minRating) return false
      }
      return passesCat(m, 'plot', minPlot) && passesCat(m, 'characters', minCharacters) &&
        passesCat(m, 'writing', minWriting) && passesCat(m, 'spice', minSpice)
    })
  }

  // Build a /library href preserving all active params, with overrides applied.
  function hrefWith(overrides: Partial<SearchParams>) {
    const merged: SearchParams = {
      status: status || undefined,
      sort: sort !== 'date_added' ? sort : undefined,
      owned: ownedOnly ? '1' : undefined,
      minRating: minRating ? String(minRating) : undefined,
      minPlot: minPlot ? String(minPlot) : undefined,
      minCharacters: minCharacters ? String(minCharacters) : undefined,
      minWriting: minWriting ? String(minWriting) : undefined,
      minSpice: minSpice ? String(minSpice) : undefined,
      tags: tagIds.length ? tagIds.join(',') : undefined,
      ...overrides,
    }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v)
    const qs = p.toString()
    return qs ? `/library?${qs}` : '/library'
  }

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      {/* Header */}
      <div className="md:flex md:items-end md:justify-between md:mb-6">
        <div>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', color: 'var(--ink)', fontWeight: 400, lineHeight: 1 }} className="text-[30px] md:text-[38px]">
            Library
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 7 }}>{books.length} books</div>
        </div>
        {/* Desktop: reading-status chips + add */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {STATUS_CHIPS.map((chip) => {
            const active = status === chip.value
            return (
              <a key={chip.value} href={hrefWith({ status: chip.value || undefined })} style={{ padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--ink)' : 'var(--card)', color: active ? 'var(--cream)' : '#7a6a5e', border: `1px solid ${active ? 'var(--ink)' : 'rgba(150,130,110,0.16)'}` }}>
                {chip.label}
              </a>
            )
          })}
          <Link href="/books/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 99, fontSize: 12.5, color: '#7a6a5e', fontWeight: 600, background: 'var(--card)', border: '1px solid rgba(150,130,110,0.16)', textDecoration: 'none' }}>
            + Add
          </Link>
        </div>
      </div>

      {/* Mobile: filter chips row */}
      <div className="flex no-scrollbar md:hidden" style={{ margin: '18px -22px 0', padding: '2px 22px 4px', gap: 9, overflowX: 'auto' }}>
        {STATUS_CHIPS.map((chip) => {
          const active = status === chip.value
          return (
            <a key={chip.value} href={hrefWith({ status: chip.value || undefined })} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--ink)' : 'var(--card)', color: active ? 'var(--cream)' : '#7a6a5e', border: `1px solid ${active ? 'var(--ink)' : 'rgba(150,130,110,0.16)'}` }}>
              {chip.label}
            </a>
          )
        })}
      </div>
      <div className="flex items-center md:hidden" style={{ marginTop: 10 }}>
        <Link href="/books/new" style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>+ Add</Link>
      </div>

      {/* Advanced filters: tags, rating, owned */}
      <LibraryFilters
        tags={tags}
        activeTagIds={tagIds}
        ratings={{ minRating, minPlot, minCharacters, minWriting, minSpice }}
        ownedOnly={ownedOnly}
        sort={sort}
      />

      {/* Book grid — 3 cols mobile, 5 cols desktop */}
      {books.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 mt-[22px]" style={{ gap: '18px 14px' }}>
          {books.map((book) => {
            const badge = book.reading_status === 'currently_reading'
              ? { text: 'Reading', bg: 'rgba(219,138,106,0.95)' }
              : book.reading_status === 'finished'
              ? { text: '✓', bg: 'rgba(123,150,107,0.95)' }
              : null
            return (
              <Link key={book.id} href={`/books/${book.id}`} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '2 / 3', borderRadius: 11, overflow: 'hidden', boxShadow: '0 12px 20px -13px rgba(90,72,55,0.5)' }}>
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: coverGradient(book.id), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '11px 10px' }}>
                      <div />
                      <div>
                        <div style={{ width: 18, height: 1.5, background: 'rgba(74,61,53,0.35)', marginBottom: 6 }} />
                        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 13, lineHeight: 1.08, color: '#3a2e27', fontWeight: 600 }}>{book.title}</div>
                        {book.author && <div style={{ fontSize: 7.5, color: 'rgba(74,61,53,0.6)', marginTop: 4, fontStyle: 'italic' }}>{book.author}</div>}
                      </div>
                    </div>
                  )}
                  {badge && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: badge.bg, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 99, lineHeight: 1 }}>{badge.text}</div>
                  )}
                </div>
                <div className="hidden md:block" style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 8, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {book.author}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p style={{ fontSize: 13 }}>No books found.</p>
          <Link href="/search" style={{ marginTop: 8, display: 'inline-block', fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Search for books to add →</Link>
        </div>
      )}
    </div>
  )
}
