import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { DeleteCollectionButton } from './DeleteCollectionButton'
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/collections" className="text-sm text-indigo-600 hover:underline">← Collections</Link>
          <h1 className="text-2xl font-bold text-stone-800 mt-1">{(collection as Collection).name}</h1>
          <p className="text-stone-400 text-sm">{books.length} {books.length === 1 ? 'book' : 'books'}</p>
        </div>
        <DeleteCollectionButton id={id} />
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm hover:border-indigo-300 transition-colors flex flex-col gap-2"
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-40 bg-stone-100 rounded-lg flex items-center justify-center text-4xl">📖</div>
              )}
              <p className="text-sm font-medium text-stone-800 line-clamp-2">{book.title}</p>
              {book.author && <p className="text-xs text-stone-400 line-clamp-1">{book.author}</p>}
              <Badge value={book.reading_status} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-stone-400 text-sm">No books in this collection yet. Open a book and toggle it in.</p>
      )}
    </div>
  )
}
