import { searchBooks } from '@/lib/books/search'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { coverGradient } from '@/lib/coverGradient'
import type { Book } from '@/lib/types'

async function importBook(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { error } = await supabase.from('books').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    author: (formData.get('author') as string) || null,
    isbn: (formData.get('isbn') as string) || null,
    description: (formData.get('description') as string) || null,
    cover_url: (formData.get('coverUrl') as string) || null,
    external_source: formData.get('source') as string,
    external_id: formData.get('externalId') as string,
  })
  const q = formData.get('q') as string
  const id = formData.get('externalId') as string
  if (error) redirect(`/search?q=${encodeURIComponent(q)}&importError=${encodeURIComponent(error.message)}`)
  redirect(`/search?q=${encodeURIComponent(q)}&imported=${encodeURIComponent(id)}`)
}

interface SearchParams { q?: string; imported?: string; importError?: string }

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, imported, importError } = await searchParams
  const supabase = await createClient()
  const results = q ? await searchBooks(q) : []

  let libraryMap: Record<string, Book> = {}
  if (results.length > 0) {
    const externalIds = results.map((r) => r.externalId)
    const { data: existing } = await supabase.from('books').select('*').in('external_id', externalIds)
    libraryMap = Object.fromEntries(((existing ?? []) as Book[]).map((b) => [b.external_id!, b]))
  }

  const GENRES = ['Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Historical', 'Thriller', 'Literary', 'Romantasy']

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      <div style={{ fontFamily: 'var(--font-newsreader), serif', color: 'var(--ink)', fontWeight: 400 }} className="text-[30px] md:text-[38px] mb-6">
        Discover
      </div>

      {/* Search bar */}
      <form method="GET" className="mb-4 md:mb-8 max-w-[640px]">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--card)', border: '1px solid rgba(150,130,110,0.16)', borderRadius: 99, padding: '0 16px', boxShadow: '0 12px 28px -20px rgba(120,95,70,0.45)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B3A595" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
          <input name="q" defaultValue={q} placeholder="Search titles, authors, genres…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '14px 12px', fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-mulish), sans-serif' }} />
        </div>
      </form>

      <Link href="/books/new" style={{ display: 'inline-block', marginBottom: 24, fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
        + Add manually
      </Link>

      {importError && <p style={{ marginBottom: 16, fontSize: 13, color: '#c0392b' }}>{decodeURIComponent(importError)}</p>}
      {q && results.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-light)' }}>No results. Try a different search or <Link href="/books/new" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>add manually</Link>.</p>}

      {results.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 16 }}>{results.length} results</div>
          {/* Mobile: single col list; Desktop: 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            {results.map((book) => {
              const owned = libraryMap[book.externalId]
              const justAdded = imported === book.externalId
              return (
                <div key={book.externalId} style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--card)', borderRadius: 18, padding: 11, border: '1px solid rgba(150,130,110,0.08)' }}>
                  <div style={{ flexShrink: 0, width: 56, height: 84, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 14px -9px rgba(90,72,55,0.5)' }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: coverGradient(book.externalId), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 6px' }}>
                        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 9, lineHeight: 1.05, color: '#3a2e27', fontWeight: 600, textAlign: 'center' }}>{book.title}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 17, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.2 }}>{book.title}</div>
                    {book.author && <div style={{ fontSize: 13, color: 'var(--ink-light)', fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif', marginTop: 2 }}>{book.author}</div>}
                    <div style={{ marginTop: 10 }}>
                      {owned ? (
                        <Link href={`/books/${owned.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: '#E7EEE0', color: 'var(--sage)', textDecoration: 'none' }}>In library →</Link>
                      ) : justAdded ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: '#E7EEE0', color: 'var(--sage)' }}>Added ✓</span>
                      ) : (
                        <form action={importBook}>
                          <input type="hidden" name="title" value={book.title} />
                          <input type="hidden" name="author" value={book.author ?? ''} />
                          <input type="hidden" name="isbn" value={book.isbn ?? ''} />
                          <input type="hidden" name="description" value={book.description ?? ''} />
                          <input type="hidden" name="coverUrl" value={book.coverUrl ?? ''} />
                          <input type="hidden" name="source" value={book.source} />
                          <input type="hidden" name="externalId" value={book.externalId} />
                          <input type="hidden" name="q" value={q ?? ''} />
                          <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}>
                            Add to Library
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!q && (
        <div>
          <div style={{ fontSize: 12, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#A8978A', fontWeight: 700, marginBottom: 14 }}>Browse by mood</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, marginBottom: 40 }}>
            {GENRES.map((genre) => (
              <a key={genre} href={`/search?q=${encodeURIComponent(genre)}`} style={{ padding: '10px 20px', borderRadius: 99, fontSize: 14, fontWeight: 600, color: 'var(--sage)', background: 'linear-gradient(135deg,#EAF0E3,#EDEBF1)', border: '1px solid rgba(120,140,115,0.16)', textDecoration: 'none' }}>
                {genre}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
