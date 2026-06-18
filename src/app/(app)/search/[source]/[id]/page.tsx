import { createClient } from '@/lib/supabase/server'
import { getExternalBookDetails } from '@/lib/books/details'
import { importExternalBook } from '@/lib/books/import'
import { coverGradient } from '@/lib/coverGradient'
import { TAG_CATEGORY_STYLE } from '@/lib/tags'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ExternalSource } from '@/lib/types'

async function addToLibrary(formData: FormData) {
  'use server'
  const source = formData.get('source') as ExternalSource
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const detail = await getExternalBookDetails(source, id)
  if (!detail) redirect(`/search/${source}/${encodeURIComponent(id)}?error=1`)

  const result = await importExternalBook(supabase, user.id, {
    title: detail.title,
    author: detail.author || null,
    isbn: detail.isbn,
    description: detail.description,
    coverUrl: detail.coverUrl,
    source: detail.source,
    externalId: detail.externalId,
    categories: detail.genres,
    pageCount: detail.pageCount,
  })
  if ('error' in result) redirect(`/search/${source}/${encodeURIComponent(id)}?error=1`)
  redirect(`/books/${result.id}`)
}

interface PageParams { source: string; id: string }

export default async function BookPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>
  searchParams: Promise<{ error?: string; q?: string; author?: string }>
}) {
  const { source, id } = await params
  const { error, q, author } = await searchParams
  const backParams = new URLSearchParams()
  if (q) backParams.set('q', q)
  if (author) backParams.set('author', author)
  const backHref = backParams.toString() ? `/search?${backParams.toString()}` : '/search'

  const detail = await getExternalBookDetails(source as ExternalSource, decodeURIComponent(id))

  const genreStyle = TAG_CATEGORY_STYLE.genre

  if (!detail) {
    return (
      <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
        <BackLink href={backHref} />
        <div style={{ marginTop: 30, textAlign: 'center', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📕</div>
          <p style={{ fontSize: 14 }}>
            Couldn&apos;t load this book&apos;s details right now
            {source === 'google' ? ' (Google Books may be rate-limited — try again later).' : '.'}
          </p>
          <Link href={backHref} style={{ marginTop: 8, display: 'inline-block', fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Back to search</Link>
        </div>
      </div>
    )
  }

  // Already in library?
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('books')
    .select('id')
    .eq('external_id', detail.externalId)
    .maybeSingle()

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      <BackLink href={backHref} />

      <div className="md:flex md:gap-10" style={{ marginTop: 20, maxWidth: 880 }}>
        {/* Cover */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 200, height: 300, borderRadius: 16, overflow: 'hidden', boxShadow: '0 26px 44px -20px rgba(90,72,55,0.55)', margin: '0 auto' }}>
            {detail.coverUrl ? (
              <img src={detail.coverUrl} alt={detail.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: coverGradient(detail.externalId), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '22px 20px' }}>
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, lineHeight: 1.1, color: '#3a2e27', fontWeight: 600, textAlign: 'center' }}>{detail.title}</div>
              </div>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="md:flex-1" style={{ marginTop: 22 }}>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 28, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.15 }}>{detail.title}</div>
          {detail.author && <div style={{ fontSize: 15, color: 'var(--ink-light)', marginTop: 6, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>by {detail.author}</div>}

          {/* Genre chips */}
          {detail.genres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {detail.genres.map((g) => (
                <span key={g} style={{ padding: '6px 13px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: genreStyle.bg, color: genreStyle.fg, border: `1px solid ${genreStyle.border}` }}>{g}</span>
              ))}
            </div>
          )}

          {/* Add / In library */}
          <div style={{ marginTop: 22 }}>
            {existing ? (
              <Link href={`/books/${existing.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: '#E7EEE0', color: 'var(--sage)', textDecoration: 'none' }}>
                ✓ In your library →
              </Link>
            ) : (
              <form action={addToLibrary}>
                <input type="hidden" name="source" value={detail.source} />
                <input type="hidden" name="id" value={decodeURIComponent(id)} />
                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}>
                  Add to Library
                </button>
              </form>
            )}
            {error && <p style={{ marginTop: 12, fontSize: 13, color: '#c0392b' }}>Something went wrong adding this book. Please try again.</p>}
          </div>

          {/* Description */}
          {detail.description ? (
            <div style={{ marginTop: 26, background: 'var(--card)', borderRadius: 22, padding: '20px 22px', border: '1px solid rgba(150,130,110,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 10 }}>About</div>
              <p style={{ fontSize: 14.5, color: '#5a4a42', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{detail.description}</p>
            </div>
          ) : (
            <p style={{ marginTop: 24, fontSize: 13.5, color: 'var(--ink-light)', fontStyle: 'italic' }}>No description available for this edition.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-light)', fontWeight: 600, textDecoration: 'none' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
      Discover
    </Link>
  )
}
