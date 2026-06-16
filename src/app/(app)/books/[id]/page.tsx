import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { updateBookDetails, setRating, addNote, deleteNote, toggleCollection, deleteBook } from './actions'
import type { Book, Rating, Note, Collection, RatingCategory } from '@/lib/types'

const CATEGORIES: { key: RatingCategory; label: string }[] = [
  { key: 'plot', label: 'Plot' },
  { key: 'characters', label: 'Characters' },
  { key: 'writing', label: 'Writing' },
  { key: 'spice', label: 'Spice' },
]

const inputClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const btnPrimary = 'rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-700 transition-colors'

export default async function BookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const { id } = await params
  const { saved } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [
    { data: book },
    { data: ratings },
    { data: notes },
    { data: allCollections },
    { data: bookCollections },
  ] = await Promise.all([
    supabase.from('books').select('*').eq('id', id).single(),
    supabase.from('ratings').select('*').eq('book_id', id),
    supabase.from('notes').select('*').eq('book_id', id).order('created_at', { ascending: false }),
    supabase.from('collections').select('*').order('name'),
    supabase.from('collection_books').select('collection_id').eq('book_id', id),
  ])

  if (!book) notFound()

  const b = book as Book
  const ratingMap = Object.fromEntries(((ratings ?? []) as Rating[]).map((r) => [r.category, r.score]))
  const memberIds = new Set((bookCollections ?? []).map((cb) => cb.collection_id))

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div className="flex gap-5">
        {b.cover_url ? (
          <img src={b.cover_url} alt={b.title} className="w-28 h-40 object-cover rounded-xl shadow shrink-0" />
        ) : (
          <div className="w-28 h-40 bg-stone-100 rounded-xl shrink-0 flex items-center justify-center text-4xl">📖</div>
        )}
        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-bold text-stone-800">{b.title}</h1>
          {b.author && <p className="text-stone-500">{b.author}</p>}
          {b.series && <p className="text-sm text-stone-400">{b.series}</p>}
          {b.isbn && <p className="text-xs text-stone-400">ISBN: {b.isbn}</p>}
          <Badge value={b.reading_status} className="mt-1 self-start" />
        </div>
      </div>

      {b.description && (
        <p className="text-sm text-stone-600 leading-relaxed">{b.description}</p>
      )}

      {/* Reading details */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-semibold text-stone-800">Reading Details</h2>
        {saved && <p className="text-sm text-green-700">Details saved.</p>}
        <form action={updateBookDetails} className="flex flex-col gap-4">
          <input type="hidden" name="bookId" value={b.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Status</label>
              <select name="reading_status" defaultValue={b.reading_status} className={inputClass}>
                <option value="not_started">Not Started</option>
                <option value="currently_reading">Currently Reading</option>
                <option value="finished">Finished</option>
                <option value="did_not_finish">Did Not Finish</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Owned</label>
              <div className="flex items-center gap-2 h-9">
                <input
                  type="checkbox"
                  name="owned"
                  defaultChecked={b.owned}
                  className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-stone-600">I own this book</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Date Started</label>
              <input type="date" name="date_started" defaultValue={b.date_started?.slice(0, 10) ?? ''} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Date Finished</label>
              <input type="date" name="date_finished" defaultValue={b.date_finished?.slice(0, 10) ?? ''} className={inputClass} />
            </div>
          </div>
          <button type="submit" className={`${btnPrimary} self-start`}>Save Details</button>
        </form>
      </div>

      {/* Ratings */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-semibold text-stone-800">Ratings</h2>
        <div className="grid grid-cols-2 gap-5">
          {CATEGORIES.map(({ key, label }) => (
            <div key={key}>
              <p className="text-sm font-medium text-stone-700 mb-1">{label}</p>
              <form action={setRating} className="flex gap-1 items-center">
                <input type="hidden" name="bookId" value={b.id} />
                <input type="hidden" name="category" value={key} />
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="submit"
                    name="score"
                    value={String(n)}
                    className={`text-2xl hover:scale-110 transition-transform leading-none ${
                      (ratingMap[key] ?? 0) >= n ? 'text-amber-400' : 'text-stone-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
                {ratingMap[key] && (
                  <span className="text-xs text-stone-400 ml-1">{ratingMap[key]}/5</span>
                )}
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-semibold text-stone-800">Private Notes</h2>
        <form action={addNote} className="flex flex-col gap-2">
          <input type="hidden" name="bookId" value={b.id} />
          <textarea
            name="body"
            placeholder="Add a note…"
            rows={3}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button type="submit" className={`${btnPrimary} self-start`}>Add Note</button>
        </form>
        {((notes ?? []) as Note[]).length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            {((notes ?? []) as Note[]).map((note) => (
              <div key={note.id} className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700 relative">
                <p className="whitespace-pre-wrap pr-8">{note.body}</p>
                <p className="text-xs text-stone-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                <form action={deleteNote} className="absolute top-2 right-2">
                  <input type="hidden" name="bookId" value={b.id} />
                  <input type="hidden" name="noteId" value={note.id} />
                  <button type="submit" className="text-stone-300 hover:text-red-500 text-xs p-1">✕</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collections */}
      {((allCollections ?? []) as Collection[]).length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-stone-800">Collections</h2>
          <div className="flex flex-wrap gap-2">
            {((allCollections ?? []) as Collection[]).map((col) => {
              const isMember = memberIds.has(col.id)
              return (
                <form key={col.id} action={toggleCollection}>
                  <input type="hidden" name="bookId" value={b.id} />
                  <input type="hidden" name="collectionId" value={col.id} />
                  <input type="hidden" name="action" value={isMember ? 'remove' : 'add'} />
                  <button
                    type="submit"
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      isMember
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-stone-600 border-stone-300 hover:border-indigo-400'
                    }`}
                  >
                    {col.name}
                  </button>
                </form>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="border-t border-stone-200 pt-4">
        <form action={deleteBook}>
          <input type="hidden" name="bookId" value={b.id} />
          <button type="submit" className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-700 transition-colors">
            Delete Book
          </button>
        </form>
      </div>
    </div>
  )
}
