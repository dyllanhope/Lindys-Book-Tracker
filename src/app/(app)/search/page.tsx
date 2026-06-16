import { searchBooks } from '@/lib/books/search'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
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
  if (error) {
    redirect(`/search?q=${encodeURIComponent(q)}&importError=${encodeURIComponent(error.message)}`)
  }
  redirect(`/search?q=${encodeURIComponent(q)}&imported=${encodeURIComponent(id)}`)
}

interface SearchParams {
  q?: string
  imported?: string
  importError?: string
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, imported, importError } = await searchParams

  const supabase = await createClient()
  const results = q ? await searchBooks(q) : []

  // Fetch which external IDs the user already has in their library
  let libraryMap: Record<string, Book> = {}
  if (results.length > 0) {
    const externalIds = results.map((r) => r.externalId)
    const { data: existing } = await supabase
      .from('books')
      .select('*')
      .in('external_id', externalIds)
    libraryMap = Object.fromEntries(((existing ?? []) as Book[]).map((b) => [b.external_id!, b]))
  }

  const btnClass = 'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Search Books</h1>
        <p className="text-stone-500 text-sm mt-1">Search Google Books & Open Library, then import to your library.</p>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, author, or ISBN…"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className={`${btnClass} bg-indigo-600 text-white hover:bg-indigo-700`}>
          Search
        </button>
      </form>

      <Link href="/books/new" className="self-start text-sm text-indigo-600 hover:underline">
        + Add manually
      </Link>

      {q && results.length === 0 && (
        <p className="text-stone-400 text-sm">No results found. Try a different search or add a book manually.</p>
      )}

      {importError && <p className="text-sm text-red-600">{decodeURIComponent(importError)}</p>}

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((book) => {
            const owned = libraryMap[book.externalId]
            const justAdded = imported === book.externalId
            return (
              <div
                key={book.externalId}
                className={`bg-white rounded-xl border p-4 shadow-sm flex gap-4 ${owned ? 'border-indigo-200 bg-indigo-50/30' : 'border-stone-200'}`}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-16 h-24 bg-stone-100 rounded shrink-0 flex items-center justify-center text-2xl">📖</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 line-clamp-2">{book.title}</p>
                  {book.author && <p className="text-sm text-stone-500 mt-0.5">{book.author}</p>}
                  {book.isbn && <p className="text-xs text-stone-400 mt-0.5">ISBN: {book.isbn}</p>}
                  {book.description && (
                    <p className="text-xs text-stone-500 mt-2 line-clamp-3">{book.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {owned ? (
                      <>
                        <Badge value={owned.reading_status} />
                        {owned.owned && <Badge value="owned" />}
                        <Link
                          href={`/books/${owned.id}`}
                          className={`${btnClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                        >
                          View in Library →
                        </Link>
                      </>
                    ) : justAdded ? (
                      <span className={`${btnClass} border border-stone-300 text-stone-500`}>Added ✓</span>
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
                        <button type="submit" className={`${btnClass} bg-indigo-600 text-white hover:bg-indigo-700`}>
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
      )}
    </div>
  )
}
