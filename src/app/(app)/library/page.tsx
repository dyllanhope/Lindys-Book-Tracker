import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Book, ReadingStatus } from '@/lib/types'

interface SearchParams {
  q?: string
  status?: string
  owned?: string
  sort?: string
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const q = params.q ?? ''
  const status = params.status ?? ''
  const owned = params.owned ?? ''
  const sort = params.sort ?? 'date_added'

  const supabase = await createClient()
  let query = supabase.from('books').select('id, title, author, cover_url, reading_status, owned, date_added')

  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`)
  if (status) query = query.eq('reading_status', status as ReadingStatus)
  if (owned === 'true') query = query.eq('owned', true)
  if (owned === 'false') query = query.eq('owned', false)

  const orderCol = sort === 'title' ? 'title' : sort === 'author' ? 'author' : 'date_added'
  query = query.order(orderCol, { ascending: sort !== 'date_added' })

  const { data: books } = await query

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-stone-800">Library</h1>
        <Link href="/books/new" className="text-sm text-indigo-600 hover:underline">+ Add manually</Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title or author…"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select name="status" defaultValue={status} className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="currently_reading">Currently Reading</option>
          <option value="finished">Finished</option>
          <option value="did_not_finish">Did Not Finish</option>
        </select>
        <select name="owned" defaultValue={owned} className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All ownership</option>
          <option value="true">Owned</option>
          <option value="false">Not Owned</option>
        </select>
        <select name="sort" defaultValue={sort} className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="date_added">Recently Added</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
        <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
          Filter
        </button>
      </form>

      {books && books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(books as Book[]).map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm hover:border-indigo-300 transition-colors flex flex-col gap-2"
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-40 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-4xl">📖</div>
              )}
              <p className="text-sm font-medium text-stone-800 line-clamp-2">{book.title}</p>
              {book.author && <p className="text-xs text-stone-400 line-clamp-1">{book.author}</p>}
              <div className="flex items-center gap-1 flex-wrap">
                <Badge value={book.reading_status} />
                {book.owned && <Badge value="owned" />}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-stone-400">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-sm">No books found.</p>
          <Link href="/search" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">Search for books to add</Link>
        </div>
      )}
    </div>
  )
}
