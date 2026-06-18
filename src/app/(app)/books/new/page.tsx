import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function createBook(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let coverUrl: string | null = null
  const coverFile = formData.get('cover') as File
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const bytes = await coverFile.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, bytes, { contentType: coverFile.type })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)
      coverUrl = publicUrl
    }
  }

  const title = (formData.get('title') as string).trim()
  if (!title) redirect('/books/new?error=Title+is+required')

  const pagesRaw = parseInt((formData.get('page_count') as string) || '', 10)
  const pageCount = Number.isFinite(pagesRaw) && pagesRaw > 0 ? pagesRaw : null

  const { data, error } = await supabase.from('books').insert({
    user_id: user.id,
    title,
    author: (formData.get('author') as string).trim() || null,
    series: (formData.get('series') as string).trim() || null,
    description: (formData.get('description') as string).trim() || null,
    cover_url: coverUrl,
    external_source: 'manual',
    page_count: pageCount,
  }).select('id').single()

  if (error) redirect(`/books/new?error=${encodeURIComponent(error.message)}`)
  redirect(`/books/${data.id}`)
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--card)',
  border: '1px solid rgba(150,130,110,0.22)',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'var(--font-mulish), sans-serif',
}

export default async function NewBookPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div style={{ padding: '62px 22px 16px', maxWidth: 480 }} className="fade-up">
      <a
        href="/library"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12.5,
          color: 'var(--ink-light)',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
        Library
      </a>

      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 28, color: 'var(--ink)', fontWeight: 500, marginBottom: 24 }}>
        Add a book
      </div>

      <form action={createBook} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>
            Title *
          </label>
          <input name="title" required placeholder="Book title" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>
            Author
          </label>
          <input name="author" placeholder="Author name" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>
            Series
          </label>
          <input name="series" placeholder="Series name (optional)" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>
            Pages
          </label>
          <input name="page_count" type="number" min="1" inputMode="numeric" placeholder="Number of pages (optional)" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Book description (optional)"
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>
            Cover Image
          </label>
          <input
            name="cover"
            type="file"
            accept="image/*"
            style={{ fontSize: 13, color: 'var(--ink-light)' }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#c0392b' }}>{decodeURIComponent(error)}</p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            style={{
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-mulish), sans-serif',
            }}
          >
            Add Book
          </button>
          <a
            href="/library"
            style={{
              background: 'transparent',
              border: '1px solid rgba(150,130,110,0.22)',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink-light)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
