'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import type { Book, Rating, Note, Collection, RatingCategory, ReadingStatus } from '@/lib/types'

const RATING_CATEGORIES: { key: RatingCategory; label: string }[] = [
  { key: 'plot', label: 'Plot' },
  { key: 'characters', label: 'Characters' },
  { key: 'writing', label: 'Writing' },
  { key: 'spice', label: 'Spice' },
]

interface Props {
  book: Book
  ratings: Rating[]
  notes: Note[]
  collections: Collection[]
  memberCollectionIds: string[]
  userId: string
}

export function BookDetail({ book, ratings, notes, collections, memberCollectionIds, userId }: Props) {

  const [status, setStatus] = useState<ReadingStatus>(book.reading_status)
  const [owned, setOwned] = useState(book.owned)
  const [dateStarted, setDateStarted] = useState(book.date_started ?? '')
  const [dateFinished, setDateFinished] = useState(book.date_finished ?? '')
  const [saving, setSaving] = useState(false)

  const ratingMap = Object.fromEntries(ratings.map((r) => [r.category, r.score]))
  const [localRatings, setLocalRatings] = useState<Record<string, number>>(ratingMap)

  const [noteText, setNoteText] = useState('')
  const [localNotes, setLocalNotes] = useState<Note[]>(notes)
  const [savingNote, setSavingNote] = useState(false)

  const [collectionIds, setCollectionIds] = useState<Set<string>>(new Set(memberCollectionIds))
  const [togglingCol, setTogglingCol] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)

  async function saveDetails() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('books').update({
      reading_status: status,
      owned,
      date_started: dateStarted || null,
      date_finished: dateFinished || null,
    }).eq('id', book.id)
    setSaving(false)
  }

  async function setRating(category: RatingCategory, score: number) {
    setLocalRatings((prev) => ({ ...prev, [category]: score }))
    const supabase = createClient()
    await supabase.from('ratings').upsert({
      book_id: book.id,
      user_id: userId,
      category,
      score,
    }, { onConflict: 'book_id,category' })
  }

  async function addNote() {
    if (!noteText.trim()) return
    setSavingNote(true)
    const supabase = createClient()
    const { data } = await supabase.from('notes').insert({
      book_id: book.id,
      user_id: userId,
      body: noteText.trim(),
    }).select().single()
    setSavingNote(false)
    if (data) {
      setLocalNotes((prev) => [data as Note, ...prev])
      setNoteText('')
    }
  }

  async function deleteNote(noteId: string) {
    const supabase = createClient()
    await supabase.from('notes').delete().eq('id', noteId)
    setLocalNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function toggleCollection(colId: string) {
    setTogglingCol(colId)
    const supabase = createClient()
    if (collectionIds.has(colId)) {
      await supabase.from('collection_books').delete().eq('collection_id', colId).eq('book_id', book.id)
      setCollectionIds((prev) => { const s = new Set(prev); s.delete(colId); return s })
    } else {
      await supabase.from('collection_books').insert({ collection_id: colId, book_id: book.id })
      setCollectionIds((prev) => new Set(prev).add(colId))
    }
    setTogglingCol(null)
  }

  async function deleteBook() {
    if (!confirm('Delete this book and all its data? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('books').delete().eq('id', book.id)
    window.location.href = '/library'
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div className="flex gap-5">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-28 h-40 object-cover rounded-xl shadow shrink-0" />
        ) : (
          <div className="w-28 h-40 bg-stone-100 rounded-xl shrink-0 flex items-center justify-center text-4xl">📖</div>
        )}
        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-bold text-stone-800">{book.title}</h1>
          {book.author && <p className="text-stone-500">{book.author}</p>}
          {book.series && <p className="text-sm text-stone-400">{book.series}</p>}
          {book.isbn && <p className="text-xs text-stone-400">ISBN: {book.isbn}</p>}
          <Badge value={book.reading_status} className="mt-1 self-start" />
        </div>
      </div>

      {book.description && (
        <p className="text-sm text-stone-600 leading-relaxed">{book.description}</p>
      )}

      {/* Reading details */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-semibold text-stone-800">Reading Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReadingStatus)}
          >
            <option value="not_started">Not Started</option>
            <option value="currently_reading">Currently Reading</option>
            <option value="finished">Finished</option>
            <option value="did_not_finish">Did Not Finish</option>
          </Select>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Owned</label>
            <div className="flex items-center gap-2 h-9">
              <input
                type="checkbox"
                checked={owned}
                onChange={(e) => setOwned(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-stone-600">I own this book</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Date Started</label>
            <input
              type="date"
              value={dateStarted}
              onChange={(e) => setDateStarted(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Date Finished</label>
            <input
              type="date"
              value={dateFinished}
              onChange={(e) => setDateFinished(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <Button onClick={saveDetails} loading={saving} size="sm">Save Details</Button>
      </div>

      {/* Ratings */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-semibold text-stone-800">Ratings</h2>
        <div className="grid grid-cols-2 gap-5">
          {RATING_CATEGORIES.map(({ key, label }) => (
            <div key={key}>
              <p className="text-sm font-medium text-stone-700 mb-1">{label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(key, n)}
                    className={`text-xl transition-transform hover:scale-110 ${
                      (localRatings[key] ?? 0) >= n ? 'text-amber-400' : 'text-stone-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
                {localRatings[key] && (
                  <span className="text-xs text-stone-400 self-center ml-1">{localRatings[key]}/5</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-semibold text-stone-800">Private Notes</h2>
        <div className="flex gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note…"
            rows={3}
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <Button size="sm" onClick={addNote} loading={savingNote} disabled={!noteText.trim()}>
          Add Note
        </Button>
        {localNotes.length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            {localNotes.map((note) => (
              <div key={note.id} className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700 relative group">
                <p className="whitespace-pre-wrap">{note.body}</p>
                <p className="text-xs text-stone-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-2 right-2 text-stone-300 hover:text-red-500 text-xs hidden group-hover:block"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-stone-800">Collections</h2>
          <div className="flex flex-wrap gap-2">
            {collections.map((col) => {
              const isMember = collectionIds.has(col.id)
              return (
                <button
                  key={col.id}
                  onClick={() => toggleCollection(col.id)}
                  disabled={togglingCol === col.id}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    isMember
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-indigo-400'
                  }`}
                >
                  {col.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="border-t border-stone-200 pt-4">
        <Button variant="danger" size="sm" onClick={deleteBook} loading={deleting}>
          Delete Book
        </Button>
      </div>
    </div>
  )
}
