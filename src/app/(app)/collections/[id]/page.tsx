import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { coverGradient } from '@/lib/coverGradient'
import { DeleteCollectionButton } from './DeleteCollectionButton'
import { ShelfColorPicker } from './ShelfColorPicker'
import type { Book, Collection } from '@/lib/types'

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: collection }, { data: collectionBooks }] = await Promise.all([
    supabase.from('collections').select('*').eq('id', id).single(),
    supabase
      .from('collection_books')
      .select('book_id, books(id, title, author, cover_url, reading_status)')
      .eq('collection_id', id),
  ])

  if (!collection) notFound()

  const books = (collectionBooks ?? []).map((cb) => cb.books).flat().filter(Boolean) as unknown as Book[]

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Link
            href="/collections"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--ink-light)', fontWeight: 600, textDecoration: 'none', marginBottom: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
            Shelves
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: 99, background: (collection as Collection).color, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-newsreader), serif', color: 'var(--ink)', fontWeight: 400, lineHeight: 1 }} className="text-[30px] md:text-[38px]">
              {(collection as Collection).name}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 7 }}>
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </div>
          <ShelfColorPicker id={id} current={(collection as Collection).color} />
        </div>
        <DeleteCollectionButton id={id} />
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 mt-[22px]" style={{ gap: '18px 14px' }}>
          {books.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '2 / 3',
                  borderRadius: 11,
                  overflow: 'hidden',
                  boxShadow: '0 12px 20px -13px rgba(90,72,55,0.5)',
                }}
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: coverGradient(book.id),
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '11px 10px',
                    }}
                  >
                    <div style={{ width: 18, height: 1.5, background: 'rgba(74,61,53,0.35)', marginBottom: 6 }} />
                    <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 13, lineHeight: 1.08, color: '#3a2e27', fontWeight: 600 }}>
                      {book.title}
                    </div>
                    {book.author && (
                      <div style={{ fontSize: 7.5, color: 'rgba(74,61,53,0.6)', marginTop: 4, fontStyle: 'italic' }}>{book.author}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="hidden md:block" style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 8, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {book.author}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--ink-light)' }}>
          No books in this shelf yet. Open a book and add it here.
        </p>
      )}
    </div>
  )
}
