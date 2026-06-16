import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Book } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: ownedCount },
    { count: finishedCount },
    { count: readingCount },
    { data: recentBooks },
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('owned', true),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'finished'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'currently_reading'),
    supabase.from('books').select('id, title, author, cover_url, reading_status, date_added').order('date_added', { ascending: false }).limit(6),
  ])

  const stats = [
    { label: 'Books Owned', value: ownedCount ?? 0 },
    { label: 'Finished', value: finishedCount ?? 0 },
    { label: 'Currently Reading', value: readingCount ?? 0 },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Your reading at a glance</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
            <p className="text-sm text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Recently Added</h2>
          <Link href="/library" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {recentBooks && recentBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(recentBooks as Book[]).map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:border-indigo-300 transition-colors flex flex-col gap-2"
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-full h-36 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-36 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-3xl">📖</div>
                )}
                <p className="text-sm font-medium text-stone-800 line-clamp-2">{book.title}</p>
                {book.author && <p className="text-xs text-stone-400">{book.author}</p>}
                <Badge value={book.reading_status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-sm">No books yet.</p>
            <Link href="/search" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">Search for a book</Link>
          </div>
        )}
      </div>
    </div>
  )
}
