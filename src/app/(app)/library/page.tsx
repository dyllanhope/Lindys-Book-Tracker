import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { coverGradient } from '@/lib/coverGradient'
import type { Book, ReadingStatus } from '@/lib/types'

const STATUS_CHIPS = [
  { value: '', label: 'All' },
  { value: 'currently_reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'not_started', label: 'Want to read' },
  { value: 'did_not_finish', label: 'Did not finish' },
]

const SORT_LABELS: Record<string, string> = {
  date_added: 'Recently added',
  title: 'Title',
  author: 'Author',
}

interface SearchParams { status?: string; sort?: string }

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const status = params.status ?? ''
  const sort = params.sort ?? 'date_added'

  const supabase = await createClient()
  let query = supabase.from('books').select('id, title, author, cover_url, reading_status, owned, date_added')
  if (status) query = query.eq('reading_status', status as ReadingStatus)
  const orderCol = sort === 'title' ? 'title' : sort === 'author' ? 'author' : 'date_added'
  query = query.order(orderCol, { ascending: sort !== 'date_added' })
  const { data: books } = await query

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      {/* Header */}
      <div className="md:flex md:items-end md:justify-between md:mb-6">
        <div>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', color: 'var(--ink)', fontWeight: 400, lineHeight: 1 }} className="text-[30px] md:text-[38px]">
            Library
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 7 }}>{books?.length ?? 0} books</div>
        </div>
        {/* Desktop: filter chips + sort inline */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {STATUS_CHIPS.map((chip) => {
            const active = status === chip.value
            return (
              <a key={chip.value} href={`/library?status=${chip.value}&sort=${sort}`} style={{ padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--ink)' : 'var(--card)', color: active ? 'var(--cream)' : '#7a6a5e', border: `1px solid ${active ? 'var(--ink)' : 'rgba(150,130,110,0.16)'}` }}>
                {chip.label}
              </a>
            )
          })}
          <div style={{ width: 1, height: 24, background: 'rgba(150,130,110,0.2)' }} />
          {Object.entries(SORT_LABELS).map(([key, label]) => {
            const active = sort === key
            return (
              <a key={key} href={`/library?status=${status}&sort=${key}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, textDecoration: 'none', background: 'var(--card)', border: '1px solid rgba(150,130,110,0.16)', color: active ? 'var(--accent)' : '#7a6a5e' }}>
                {label}
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
            <a key={chip.value} href={`/library?status=${chip.value}&sort=${sort}`} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--ink)' : 'var(--card)', color: active ? 'var(--cream)' : '#7a6a5e', border: `1px solid ${active ? 'var(--ink)' : 'rgba(150,130,110,0.16)'}` }}>
              {chip.label}
            </a>
          )
        })}
      </div>
      <div className="flex items-center md:hidden" style={{ marginTop: 10, gap: 6 }}>
        {Object.entries(SORT_LABELS).map(([key, label]) => {
          const active = sort === key
          return (
            <a key={key} href={`/library?status=${status}&sort=${key}`} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--accent-light)' : 'transparent', color: active ? 'var(--accent)' : '#B3A595' }}>
              {label}
            </a>
          )
        })}
        <Link href="/books/new" style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>+ Add</Link>
      </div>

      {/* Book grid — 3 cols mobile, 5 cols desktop */}
      {books && books.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 mt-[22px]" style={{ gap: '18px 14px' }}>
          {(books as Book[]).map((book) => {
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
