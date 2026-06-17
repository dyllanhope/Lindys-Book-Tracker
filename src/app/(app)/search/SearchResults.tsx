'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { coverGradient } from '@/lib/coverGradient'
import { importSearchResult } from './actions'
import type { Book, ExternalBook, ExternalSource } from '@/lib/types'

/** Clean, slash-free id for use in routes (mirrors toRouteId without server deps). */
function toRouteId(source: ExternalSource, externalId: string): string {
  if (source === 'openlibrary') return externalId.replace(/^\/?(works\/)?/, '')
  return externalId
}

interface SearchResponse {
  results: ExternalBook[]
  owned: Record<string, Book>
  hasMore: boolean
}

export function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const author = searchParams.get('author') ?? ''

  // Controlled inputs (local), separate from the committed URL search terms.
  const [titleInput, setTitleInput] = useState(q)
  const [authorInput, setAuthorInput] = useState(author)
  useEffect(() => { setTitleInput(q); setAuthorInput(author) }, [q, author])

  const [results, setResults] = useState<ExternalBook[]>([])
  const [owned, setOwned] = useState<Record<string, Book>>({})
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Guards against out-of-order responses when terms change quickly.
  const reqId = useRef(0)

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    const id = ++reqId.current
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (author) params.set('author', author)
    params.set('page', String(pageNum))
    try {
      const res = await fetch(`/api/search?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: SearchResponse = await res.json()
      if (id !== reqId.current) return // a newer request superseded this one
      setOwned((prev) => (append ? { ...prev, ...data.owned } : data.owned))
      setResults((prev) => (append ? [...prev, ...data.results] : data.results))
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch {
      if (id !== reqId.current) return
      setError('Search failed. Please try again.')
    }
  }, [q, author])

  // Run a fresh search whenever the committed terms change.
  useEffect(() => {
    if (!q && !author) {
      setResults([]); setOwned({}); setHasMore(false); setError(null)
      return
    }
    setLoading(true); setError(null)
    fetchPage(1, false).finally(() => setLoading(false))
  }, [q, author, fetchPage])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (titleInput.trim()) params.set('q', titleInput.trim())
    if (authorInput.trim()) params.set('author', authorInput.trim())
    router.push(`/search?${params.toString()}`)
  }

  function loadMore() {
    setLoadingMore(true)
    fetchPage(page + 1, true).finally(() => setLoadingMore(false))
  }

  function addBook(book: ExternalBook) {
    startTransition(async () => {
      const result = await importSearchResult(book)
      if ('id' in result) {
        setAddedIds((prev) => new Set(prev).add(book.externalId))
      } else {
        setError(result.error)
      }
    })
  }

  const hasSearch = Boolean(q || author)
  const GENRES = ['Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Historical', 'Thriller', 'Literary', 'Romantasy']

  const inputBase: React.CSSProperties = {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    padding: '14px 12px', fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-mulish), sans-serif',
  }
  const fieldShell: React.CSSProperties = {
    position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--card)',
    border: '1px solid rgba(150,130,110,0.16)', borderRadius: 99, padding: '0 16px',
    boxShadow: '0 12px 28px -20px rgba(120,95,70,0.45)',
  }

  return (
    <div>
      {/* Search form: title + optional author */}
      <form onSubmit={submit} className="mb-4 md:mb-8 max-w-[640px]">
        <div style={fieldShell}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B3A595" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
          <input name="q" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder="Search by title, genre…" style={inputBase} />
        </div>
        <div className="flex gap-2 mt-2 items-center">
          <div style={{ ...fieldShell, flex: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3A595" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input name="author" value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} placeholder="Author (optional)…" style={inputBase} />
          </div>
          <button type="submit" style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 99, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-mulish), sans-serif' }}>
            Search
          </button>
        </div>
      </form>

      <Link href="/books/new" style={{ display: 'inline-block', marginBottom: 24, fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
        + Add manually
      </Link>

      {error && <p style={{ marginBottom: 16, fontSize: 13, color: '#c0392b' }}>{error}</p>}
      {loading && <p style={{ fontSize: 13, color: 'var(--ink-light)' }}>Searching…</p>}
      {hasSearch && !loading && results.length === 0 && !error && (
        <p style={{ fontSize: 13, color: 'var(--ink-light)' }}>No results. Try a different search or <Link href="/books/new" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>add manually</Link>.</p>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 16 }}>Showing {results.length} result{results.length === 1 ? '' : 's'}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            {results.map((book) => {
              const ownedBook = owned[book.externalId]
              const justAdded = addedIds.has(book.externalId)
              const qs = new URLSearchParams()
              if (q) qs.set('q', q)
              if (author) qs.set('author', author)
              const previewHref = `/search/${book.source}/${encodeURIComponent(toRouteId(book.source, book.externalId))}?${qs.toString()}`
              return (
                <div key={book.externalId} style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--card)', borderRadius: 18, padding: 11, border: '1px solid rgba(150,130,110,0.08)' }}>
                  <Link href={previewHref} style={{ flexShrink: 0, width: 56, height: 84, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 14px -9px rgba(90,72,55,0.5)', display: 'block' }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: coverGradient(book.externalId), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 6px' }}>
                        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 9, lineHeight: 1.05, color: '#3a2e27', fontWeight: 600, textAlign: 'center' }}>{book.title}</div>
                      </div>
                    )}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={previewHref} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 17, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.2 }}>{book.title}</div>
                      {book.author && <div style={{ fontSize: 13, color: 'var(--ink-light)', fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif', marginTop: 2 }}>{book.author}</div>}
                    </Link>
                    <div style={{ marginTop: 10 }}>
                      {ownedBook ? (
                        <Link href={`/books/${ownedBook.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: '#E7EEE0', color: 'var(--sage)', textDecoration: 'none' }}>In library →</Link>
                      ) : justAdded ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: '#E7EEE0', color: 'var(--sage)' }}>Added ✓</span>
                      ) : (
                        <button type="button" onClick={() => addBook(book)} style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}>
                          Add to Library
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <button type="button" onClick={loadMore} disabled={loadingMore} style={{ padding: '11px 26px', borderRadius: 99, fontSize: 13.5, fontWeight: 600, background: 'var(--card)', color: 'var(--ink)', border: '1px solid rgba(150,130,110,0.22)', cursor: loadingMore ? 'default' : 'pointer', opacity: loadingMore ? 0.6 : 1, fontFamily: 'var(--font-mulish), sans-serif' }}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

      {!hasSearch && !loading && (
        <div>
          <div style={{ fontSize: 12, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#A8978A', fontWeight: 700, marginBottom: 14 }}>Browse by mood</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, marginBottom: 40 }}>
            {GENRES.map((genre) => (
              <button key={genre} type="button" onClick={() => router.push(`/search?q=${encodeURIComponent(genre)}`)} style={{ padding: '10px 20px', borderRadius: 99, fontSize: 14, fontWeight: 600, color: 'var(--sage)', background: 'linear-gradient(135deg,#EAF0E3,#EDEBF1)', border: '1px solid rgba(120,140,115,0.16)', cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}>
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
