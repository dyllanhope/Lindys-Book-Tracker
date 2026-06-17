'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { coverGradient } from '@/lib/coverGradient'
import { findOrCreateTag, TAG_CATEGORIES, TAG_CATEGORY_LABEL, TAG_CATEGORY_STYLE } from '@/lib/tags'
import type { Book, Rating, Note, Collection, Tag, RatingCategory, ReadingStatus, TagCategory } from '@/lib/types'

const RATING_CATEGORIES: { key: RatingCategory; label: string }[] = [
  { key: 'plot', label: 'Plot' },
  { key: 'characters', label: 'Characters' },
  { key: 'writing', label: 'Writing' },
]

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: 'currently_reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'not_started', label: 'Want to read' },
  { value: 'did_not_finish', label: 'Did not finish' },
]

const SPICE_LABELS = ['', 'A gentle simmer', 'A little heat', 'Pleasantly steamy', 'Properly spicy', 'Five-alarm']

interface Props {
  book: Book
  ratings: Rating[]
  notes: Note[]
  collections: Collection[]
  memberCollectionIds: string[]
  bookTags: Tag[]
  allTags: Tag[]
  userId: string
}

export function BookDetail({ book, ratings, notes, collections, memberCollectionIds, bookTags, allTags, userId }: Props) {
  const [status, setStatus] = useState<ReadingStatus>(book.reading_status)
  const [owned, setOwned] = useState(book.owned)
  const [saving, setSaving] = useState(false)

  const ratingMap = Object.fromEntries(ratings.map((r) => [r.category, r.score]))
  const [localRatings, setLocalRatings] = useState<Record<string, number>>(ratingMap)
  const [noteText, setNoteText] = useState('')
  const [localNotes, setLocalNotes] = useState<Note[]>(notes)
  const [savingNote] = useState(false)
  const [collectionIds, setCollectionIds] = useState<Set<string>>(new Set(memberCollectionIds))
  const [togglingCol, setTogglingCol] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [localTags, setLocalTags] = useState<Tag[]>(bookTags)
  const [knownTags, setKnownTags] = useState<Tag[]>(allTags)
  const [tagInput, setTagInput] = useState('')
  const [tagCategory, setTagCategory] = useState<TagCategory>('genre')
  const [addingTag, setAddingTag] = useState(false)

  async function saveDetails() {
    setSaving(true)
    const supabase = createClient()
    // Supabase query builders are lazy — they only run when awaited.
    await supabase.from('books').update({ reading_status: status, owned }).eq('id', book.id)
    setSaving(false)
  }

  async function setRating(category: RatingCategory, score: number) {
    const newScore = localRatings[category] === score ? 0 : score
    setLocalRatings((prev) => ({ ...prev, [category]: newScore }))
    const supabase = createClient()
    if (newScore === 0) {
      await supabase.from('ratings').delete().eq('book_id', book.id).eq('category', category)
    } else {
      await supabase.from('ratings').upsert({ book_id: book.id, user_id: userId, category, score: newScore }, { onConflict: 'book_id,category' })
    }
  }

  async function addNote() {
    if (!noteText.trim()) return
    // Optimistic: show note immediately, replace with real record once DB responds
    const body = noteText.trim()
    const tempId = `temp-${Date.now()}`
    const tempNote = { id: tempId, book_id: book.id, user_id: userId, body, created_at: new Date().toISOString() } as Note
    setLocalNotes((prev) => [tempNote, ...prev])
    setNoteText('')
    const supabase = createClient()
    const { data } = await supabase.from('notes').insert({ book_id: book.id, user_id: userId, body }).select().single()
    if (data) setLocalNotes((prev) => prev.map((n) => n.id === tempId ? data as Note : n))
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

  async function addTag(name: string, category: TagCategory) {
    const trimmed = name.trim()
    if (!trimmed || addingTag) return
    setAddingTag(true)
    const supabase = createClient()
    const tag = await findOrCreateTag(supabase, userId, trimmed, category)
    if (tag && !localTags.some((t) => t.id === tag.id)) {
      await supabase.from('book_tags').insert({ book_id: book.id, tag_id: tag.id })
      setLocalTags((prev) => [...prev, tag])
      setKnownTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]))
    }
    setTagInput('')
    setAddingTag(false)
  }

  async function removeTag(tagId: string) {
    setLocalTags((prev) => prev.filter((t) => t.id !== tagId))
    const supabase = createClient()
    await supabase.from('book_tags').delete().eq('book_id', book.id).eq('tag_id', tagId)
  }

  async function deleteBook() {
    if (!confirm('Delete this book and all its data? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('books').delete().eq('id', book.id)
    window.location.href = '/library'
  }

  const spice = localRatings['spice'] ?? 0
  const heroColor = coverGradient(book.id).match(/#[A-Fa-f0-9]{6}/g)?.[1] ?? '#E9DAC6'

  const tagIdsSet = new Set(localTags.map((t) => t.id))
  const tagQuery = tagInput.trim().toLowerCase()
  const tagSuggestions = knownTags
    .filter((t) => t.category === tagCategory && !tagIdsSet.has(t.id) && (tagQuery === '' || t.name.toLowerCase().includes(tagQuery)))
    .slice(0, 6)
  const exactMatchExists = knownTags.some((t) => t.category === tagCategory && t.name.toLowerCase() === tagQuery)
  const sortedTags = [...localTags].sort((a, b) =>
    a.category === b.category ? a.name.localeCompare(b.name) : TAG_CATEGORIES.findIndex((c) => c.value === a.category) - TAG_CATEGORIES.findIndex((c) => c.value === b.category),
  )

  return (
    /* Outer: block on mobile, flex row on desktop */
    <div className="md:flex" style={{ minHeight: '100vh', position: 'relative' }}>

      {/* ── Left / Top: cover panel ── */}
      <div
        className="md:flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${heroColor} 0%, var(--cream) 100%)`,
          borderRight: '1px solid rgba(150,130,110,0.1)',
          position: 'relative',
          zIndex: 0,
        }}
      >
        {/* Mobile: relative hero block */}
        <div className="md:hidden" style={{ position: 'relative', padding: '62px 22px 26px', overflow: 'hidden' }}>
          <a
            href="/library"
            style={{
              position: 'absolute', top: 58, left: 18, zIndex: 5, width: 38, height: 38,
              borderRadius: 99, background: 'rgba(255,253,248,0.85)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', boxShadow: '0 4px 10px -5px rgba(90,72,55,0.4)', textDecoration: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 12 }}>
            <CoverImage book={book} width={172} height={258} fontSize={24} />
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 25, color: 'var(--ink)', fontWeight: 500, marginTop: 22, lineHeight: 1.15, maxWidth: 300 }}>{book.title}</div>
            {book.author && <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 4, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>by {book.author}</div>}
            <OwnedButton owned={owned} onToggle={() => setOwned(!owned)} />
          </div>
        </div>

        {/* Desktop: sticky column */}
        <div
          className="hidden md:flex"
          style={{ width: 320, height: '100vh', flexDirection: 'column', alignItems: 'center', padding: '48px 28px 40px' }}
        >
          <a
            href="/library"
            style={{ alignSelf: 'flex-start', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-light)', fontWeight: 600, textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
            Library
          </a>
          <CoverImage book={book} width={200} height={300} fontSize={22} />
          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginTop: 22, lineHeight: 1.2, textAlign: 'center' }}>{book.title}</div>
          {book.author && <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 4, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif', textAlign: 'center' }}>by {book.author}</div>}
          <OwnedButton owned={owned} onToggle={() => setOwned(!owned)} />
          <div style={{ marginTop: 'auto', paddingTop: 32 }}>
            <button
              onClick={deleteBook}
              disabled={deleting}
              style={{ background: 'transparent', border: '1px solid rgba(150,130,110,0.22)', borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--ink-light)', cursor: 'pointer', opacity: deleting ? 0.5 : 1, fontFamily: 'var(--font-mulish), sans-serif' }}
            >
              {deleting ? 'Deleting…' : 'Delete book'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right / Bottom: journal content ── */}
      <div className="md:flex-1" style={{ padding: '4px 22px 40px', marginTop: 6, position: 'relative', zIndex: 1 }}>
        <div>

          {/* Status segment */}
          <div style={{ display: 'flex', gap: 4, background: '#F0E8D8', borderRadius: 15, padding: 4 }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                style={{
                  flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 12, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'all .2s',
                  background: status === opt.value ? 'var(--card)' : 'transparent',
                  color: status === opt.value ? 'var(--ink)' : 'var(--ink-light)',
                  boxShadow: status === opt.value ? '0 4px 10px -6px rgba(90,72,55,0.4)' : 'none',
                  fontFamily: 'var(--font-mulish), sans-serif',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={saveDetails}
            disabled={saving}
            style={{
              display: 'block', width: '100%', marginTop: 12, background: 'var(--ink)', color: 'var(--cream)',
              border: 'none', borderRadius: 12, padding: '11px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'var(--font-mulish), sans-serif',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          {/* Description */}
          {book.description && (
            <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '18px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 10 }}>About</div>
              <p style={{ fontSize: 14, color: '#5a4a42', lineHeight: 1.65 }}>{book.description}</p>
            </div>
          )}

          {/* Ratings */}
          <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '22px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 18 }}>How was it?</div>
            {RATING_CATEGORIES.map(({ key, label }, i) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < RATING_CATEGORIES.length - 1 ? 16 : 0 }}>
                <span style={{ fontSize: 14, color: '#7a6a5e', fontWeight: 500 }}>{label}</span>
                <div style={{ display: 'flex' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(key, n)} style={{ fontSize: 26, cursor: 'pointer', lineHeight: 1, color: (localRatings[key] ?? 0) >= n ? '#E0A24A' : '#E7DCCB', transition: 'color .15s', marginRight: 3, background: 'none', border: 'none', padding: 0 }}>★</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: 'rgba(150,130,110,0.12)', margin: '18px -2px 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: '#7a6a5e', fontWeight: 500 }}>Spice</div>
                {spice > 0 && <div style={{ fontSize: 11, color: '#C9A18A', marginTop: 2, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>{SPICE_LABELS[spice]}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating('spice', n)} style={{ fontSize: 22, cursor: 'pointer', lineHeight: 1, marginRight: 4, transition: 'all .15s', filter: spice >= n ? 'none' : 'grayscale(0.9)', opacity: spice >= n ? 1 : 0.32, background: 'none', border: 'none', padding: 0 }}>🌶️</button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '22px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 16 }}>Tags</div>

            {/* Current tags */}
            {sortedTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {sortedTags.map((tag) => {
                  const s = TAG_CATEGORY_STYLE[tag.category]
                  return (
                    <span key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}>
                      {tag.name}
                      <button onClick={() => removeTag(tag.id)} aria-label={`Remove ${tag.name}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 99, border: 'none', background: 'rgba(0,0,0,0.06)', color: s.fg, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Category selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {TAG_CATEGORIES.map((cat) => {
                const active = tagCategory === cat.value
                return (
                  <button key={cat.value} type="button" onClick={() => setTagCategory(cat.value)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${active ? 'rgba(150,130,110,0.4)' : 'rgba(150,130,110,0.16)'}`, background: active ? '#F0E8D8' : 'transparent', color: active ? 'var(--ink)' : 'var(--ink-light)', fontFamily: 'var(--font-mulish), sans-serif' }}>
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Add input */}
            <form
              onSubmit={(e) => { e.preventDefault(); addTag(tagInput, tagCategory) }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={`Add a ${TAG_CATEGORY_LABEL[tagCategory].toLowerCase()} tag…`}
                style={{ flex: 1, border: '1px solid rgba(150,130,110,0.2)', borderRadius: 10, padding: '9px 12px', fontSize: 14, color: '#5a4a42', background: 'var(--cream)', outline: 'none', fontFamily: 'var(--font-mulish), sans-serif' }}
              />
              <button
                type="submit"
                disabled={!tagInput.trim() || addingTag}
                style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: tagInput.trim() ? 'pointer' : 'default', opacity: tagInput.trim() && !addingTag ? 1 : 0.4, fontFamily: 'var(--font-mulish), sans-serif' }}
              >
                Add
              </button>
            </form>

            {/* Suggestions from existing tags */}
            {(tagSuggestions.length > 0 || (tagQuery !== '' && !exactMatchExists)) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                {tagSuggestions.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => addTag(tag.name, tag.category)} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--ink-light)', border: '1px solid rgba(150,130,110,0.2)', fontFamily: 'var(--font-mulish), sans-serif' }}>
                    {tag.name}
                  </button>
                ))}
                {tagQuery !== '' && !exactMatchExists && (
                  <button type="button" onClick={() => addTag(tagInput, tagCategory)} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: 'var(--accent-light)', color: '#C9A18A', border: '1px solid rgba(200,170,130,0.3)', fontFamily: 'var(--font-mulish), sans-serif' }}>
                    + Create “{tagInput.trim()}”
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginTop: 22, background: '#FBF3E4', borderRadius: 22, padding: 20, border: '1px solid rgba(200,170,130,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A18A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              <span style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500 }}>My notes</span>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What did this one make you feel?…"
              className="note-area"
              style={{ width: '100%', minHeight: 96, border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: '#5a4a42', background: 'transparent' }}
            />
            <button
              onClick={addNote}
              disabled={savingNote || !noteText.trim()}
              style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: noteText.trim() ? 'pointer' : 'default', opacity: noteText.trim() ? 1 : 0.4, fontFamily: 'var(--font-mulish), sans-serif' }}
            >
              {savingNote ? 'Saving…' : 'Add note'}
            </button>
            {localNotes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {localNotes.map((note) => (
                  <div key={note.id} style={{ background: 'rgba(255,253,248,0.8)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 14, color: '#5a4a42', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{note.body}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: '#B3A595' }}>{new Date(note.created_at).toLocaleDateString()}</span>
                      <button onClick={() => deleteNote(note.id)} style={{ fontSize: 11, color: '#B3A595', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '22px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 16 }}>In your shelves</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {collections.map((col) => {
                  const isMember = collectionIds.has(col.id)
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleCollection(col.id)}
                      disabled={togglingCol === col.id}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', background: isMember ? '#E7EEE0' : 'var(--card)', color: isMember ? 'var(--sage)' : 'var(--ink-light)', border: `1px solid ${isMember ? 'rgba(120,150,110,0.4)' : 'rgba(150,130,110,0.16)'}`, fontFamily: 'var(--font-mulish), sans-serif' }}
                    >
                      {col.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Delete — mobile only (desktop has it in the left panel) */}
          <div className="md:hidden" style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid rgba(150,130,110,0.14)' }}>
            <button
              onClick={deleteBook}
              disabled={deleting}
              style={{ background: 'transparent', border: '1px solid rgba(150,130,110,0.22)', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: 'var(--ink-light)', cursor: 'pointer', opacity: deleting ? 0.5 : 1, fontFamily: 'var(--font-mulish), sans-serif' }}
            >
              {deleting ? 'Deleting…' : 'Delete book'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function CoverImage({ book, width, height, fontSize }: { book: Book; width: number; height: number; fontSize: number }) {
  return (
    <div style={{ width, height, borderRadius: 16, overflow: 'hidden', boxShadow: '0 26px 44px -20px rgba(90,72,55,0.55)', flexShrink: 0 }}>
      {book.cover_url ? (
        <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: coverGradient(book.id), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px 20px' }}>
          <div />
          <div>
            <div style={{ width: 30, height: 2, background: 'rgba(74,61,53,0.4)', margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize, lineHeight: 1.1, color: '#3a2e27', fontWeight: 600, textAlign: 'center' }}>{book.title}</div>
            {book.author && <div style={{ fontSize: 11, color: 'rgba(74,61,53,0.65)', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>{book.author}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function OwnedButton({ owned, onToggle }: { owned: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, padding: '8px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: owned ? '1px solid rgba(120,150,110,0.35)' : '1px solid rgba(200,170,130,0.3)', background: owned ? '#E7EEE0' : 'var(--accent-light)', color: owned ? 'var(--sage)' : '#C9A18A', transition: 'all .2s' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
      {owned ? 'On your shelf' : 'On your wishlist'}
    </button>
  )
}
