import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { coverGradient } from '@/lib/coverGradient'
import type { Book, Collection } from '@/lib/types'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function todayDate() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function MiniCover({ book }: { book: Pick<Book, 'id' | 'title' | 'cover_url'> }) {
  if (book.cover_url) {
    return <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  }
  return (
    <div style={{ width: '100%', height: '100%', background: coverGradient(book.id), display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 9px' }}>
      <div style={{ width: 14, height: 1.5, background: 'rgba(74,61,53,0.3)', borderRadius: 2, marginBottom: 5 }} />
      <div style={{ fontFamily: 'var(--font-newsreader), Georgia, serif', fontSize: 12, lineHeight: 1.1, color: '#3a2e27', fontWeight: 600 }}>
        {book.title}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: reading },
    { data: recent },
    { count: finishedCount },
    { count: readingCount },
    { count: tbrCount },
    { data: collectionsRaw },
  ] = await Promise.all([
    supabase.from('books').select('id, title, author, cover_url, reading_status, owned, date_added, date_started, date_finished, created_at, updated_at, user_id, series, isbn, description, external_source, external_id').eq('reading_status', 'currently_reading').order('date_started', { ascending: false }).limit(3),
    supabase.from('books').select('id, title, author, cover_url, reading_status, owned, date_added, date_started, date_finished, created_at, updated_at, user_id, series, isbn, description, external_source, external_id').order('date_added', { ascending: false }).limit(8),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'finished'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'currently_reading'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'not_started'),
    supabase.from('collections').select('id, name, created_at, user_id').order('created_at', { ascending: true }).limit(4),
  ])

  const featured = reading?.[0] as Book | undefined
  const second = reading?.[1] as Book | undefined
  const recentBooks = (recent ?? []) as Book[]
  const collections = (collectionsRaw ?? []) as Collection[]

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">

      {/* Greeting */}
      <div className="md:flex md:items-end md:justify-between md:mb-8 mb-0">
        <div>
          <div style={{ fontSize: 12, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#A8978A', fontWeight: 600 }}>
            {greeting()}
          </div>
          <div style={{ fontFamily: 'var(--font-newsreader), Georgia, serif', lineHeight: 1.15, color: 'var(--ink)', marginTop: 8, fontWeight: 400 }} className="text-[28px] md:text-[38px]">
            Ready for your next chapter?
          </div>
        </div>
        <div className="hidden md:block" style={{ fontSize: 14, color: '#B3A595', fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>
          {todayDate()}
        </div>
      </div>

      {/* Currently Reading */}
      {featured ? (
        <>
          {/* Mobile hero */}
          <div className="md:hidden">
            <div style={{ marginTop: 26, fontFamily: 'var(--font-newsreader), serif', fontSize: 19, color: 'var(--ink)', fontWeight: 500 }}>
              Currently reading
            </div>
            <Link href={`/books/${featured.id}`} style={{ marginTop: 14, background: 'var(--card)', borderRadius: 26, padding: 18, display: 'flex', gap: 18, boxShadow: '0 16px 30px -22px rgba(120,95,70,0.5)', textDecoration: 'none', border: '1px solid rgba(150,130,110,0.08)' }}>
              <div style={{ flex: 'none', width: 104, height: 156, borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 22px -12px rgba(90,72,55,0.45)' }}>
                <MiniCover book={featured} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 0' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 19, lineHeight: 1.2, color: 'var(--ink)', fontWeight: 500 }}>{featured.title}</div>
                  {featured.author && <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 3, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>{featured.author}</div>}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink)', color: 'var(--cream)', fontSize: 12.5, fontWeight: 600, padding: '9px 16px', borderRadius: 99 }}>
                  Continue <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
                </div>
              </div>
            </Link>
            {second && (
              <Link href={`/books/${second.id}`} style={{ marginTop: 12, background: 'var(--card)', borderRadius: 20, padding: '12px 16px 12px 12px', display: 'flex', gap: 13, alignItems: 'center', textDecoration: 'none', border: '1px solid rgba(150,130,110,0.08)' }}>
                <div style={{ flex: 'none', width: 42, height: 60, borderRadius: 8, overflow: 'hidden' }}><MiniCover book={second} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 15, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{second.title}</div>
                  {second.author && <div style={{ fontSize: 12, color: 'var(--ink-light)', fontStyle: 'italic' }}>{second.author}</div>}
                </div>
              </Link>
            )}
          </div>

          {/* Desktop hero */}
          <Link href={`/books/${featured.id}`} className="hidden md:flex" style={{ background: 'var(--card)', borderRadius: 28, padding: '28px 32px', gap: 32, cursor: 'pointer', boxShadow: '0 20px 48px -28px rgba(120,95,70,0.4)', border: '1px solid rgba(150,130,110,0.07)', marginBottom: 24, textDecoration: 'none' }}>
            <div style={{ position: 'relative', flexShrink: 0, width: 130, height: 195, borderRadius: 16, overflow: 'hidden', boxShadow: '0 18px 32px -16px rgba(90,72,55,0.5)' }}>
              <MiniCover book={featured} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#A8978A', fontWeight: 700 }}>Currently reading</div>
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 30, color: 'var(--ink)', fontWeight: 400, lineHeight: 1.15, marginTop: 10 }}>{featured.title}</div>
                {featured.author && <div style={{ fontSize: 15, color: 'var(--ink-light)', marginTop: 4, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>by {featured.author}</div>}
              </div>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10 }}>
              {second && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F5EDE0', borderRadius: 16, padding: '12px 16px', minWidth: 220 }}>
                  <div style={{ flexShrink: 0, width: 36, height: 52, borderRadius: 7, overflow: 'hidden' }}><MiniCover book={second} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#A8978A', fontWeight: 600 }}>Also reading</div>
                    <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 14, color: 'var(--ink)', fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{second.title}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ink)', color: 'var(--cream)', fontSize: 13, fontWeight: 600, padding: '12px 22px', borderRadius: 99, alignSelf: 'flex-end' }}>
                Continue reading <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
              </div>
            </div>
          </Link>
        </>
      ) : (
        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 19, color: 'var(--ink)', fontWeight: 500 }}>Currently reading</div>
          <div style={{ marginTop: 14, background: 'var(--card)', borderRadius: 20, padding: '20px 18px', border: '1px solid rgba(150,130,110,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ink-light)' }}>No books in progress.</p>
            <Link href="/search" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>Find something to read →</Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-[26px] md:mt-0 md:mb-9">
        {/* Mobile stat */}
        <div className="md:hidden col-span-3" style={{ background: 'linear-gradient(135deg, #E9F0E3 0%, #E7EEE9 55%, #EDEBF1 100%)', borderRadius: 26, padding: '22px 22px 20px' }}>
          <div style={{ fontSize: 12, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#8a9a86', fontWeight: 700 }}>Your library</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            {[{ label: 'finished', val: finishedCount ?? 0 }, { label: 'reading', val: readingCount ?? 0 }, { label: 'to read', val: tbrCount ?? 0 }].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 32, color: 'var(--sage)', fontWeight: 500, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#8a9a86', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop stats — 3 separate cards */}
        <div className="hidden md:flex" style={{ background: 'linear-gradient(135deg,#E9F0E3,#E7EEE9)', borderRadius: 22, padding: '22px 26px', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 44, color: '#5b7a5a', fontWeight: 400, lineHeight: 1 }}>{finishedCount ?? 0}</div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#5b7a5a' }}>books read</div><div style={{ fontSize: 12, color: '#8a9a86', marginTop: 3 }}>this year</div></div>
        </div>
        <div className="hidden md:flex" style={{ background: 'linear-gradient(135deg,#F5E8DC,#EFE2D2)', borderRadius: 22, padding: '22px 26px', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 44, color: '#C9845A', fontWeight: 400, lineHeight: 1 }}>{readingCount ?? 0}</div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#C9845A' }}>reading</div><div style={{ fontSize: 12, color: '#C9A18A', marginTop: 3 }}>right now</div></div>
        </div>
        <div className="hidden md:flex" style={{ background: 'linear-gradient(135deg,#EDE8F2,#E8E2EF)', borderRadius: 22, padding: '22px 26px', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 44, color: '#8878A8', fontWeight: 400, lineHeight: 1 }}>{tbrCount ?? 0}</div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#8878A8' }}>to read</div><div style={{ fontSize: 12, color: '#AFA0C8', marginTop: 3 }}>on the list</div></div>
        </div>
      </div>

      {/* Recently Added */}
      <div style={{ marginTop: 30, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 19, color: 'var(--ink)', fontWeight: 500 }} className="md:text-[22px]">
          Recently added
        </div>
        <Link href="/library" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>See all →</Link>
      </div>
      {recentBooks.length > 0 ? (
        <div className="no-scrollbar" style={{ margin: '14px -22px 0', padding: '4px 22px', display: 'flex', gap: 14, overflowX: 'auto' }}>
          {recentBooks.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} style={{ flexShrink: 0, width: 108, textDecoration: 'none' }} className="md:w-[124px]">
              <div style={{ width: '100%', height: 162, borderRadius: 13, overflow: 'hidden', boxShadow: '0 12px 22px -14px rgba(90,72,55,0.5)' }} className="md:h-[186px] md:rounded-[14px]">
                <MiniCover book={book} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-light)' }}>
          No books yet. <Link href="/search" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Add one →</Link>
        </div>
      )}

      {/* Shelves */}
      {collections.length > 0 && (
        <>
          <div style={{ marginTop: 30, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 19, color: 'var(--ink)', fontWeight: 500 }} className="md:text-[22px]">
              Your shelves
            </div>
            <Link href="/collections" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>All shelves →</Link>
          </div>
          {/* Mobile: horizontal scroll */}
          <div className="no-scrollbar md:hidden" style={{ margin: '14px -22px 0', padding: '4px 22px', display: 'flex', gap: 14, overflowX: 'auto' }}>
            {collections.map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`} style={{ flexShrink: 0, width: 172, background: 'var(--card)', borderRadius: 22, padding: 16, textDecoration: 'none', border: '1px solid rgba(150,130,110,0.08)', boxShadow: '0 12px 24px -20px rgba(120,95,70,0.5)' }}>
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 17, color: 'var(--ink)', fontWeight: 500 }}>{col.name}</div>
              </Link>
            ))}
          </div>
          {/* Desktop: 4-col grid */}
          <div className="hidden md:grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 18 }}>
            {collections.map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`} style={{ background: 'var(--card)', borderRadius: 22, padding: 18, textDecoration: 'none', border: '1px solid rgba(150,130,110,0.08)', boxShadow: '0 12px 24px -20px rgba(120,95,70,0.5)', display: 'block' }}>
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 17, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.2 }}>{col.name}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
