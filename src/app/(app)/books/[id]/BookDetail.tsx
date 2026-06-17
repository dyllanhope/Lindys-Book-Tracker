'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { coverGradient } from '@/lib/coverGradient'
import type { Book, Rating, Note, Collection, RatingCategory, ReadingStatus } from '@/lib/types'

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
  userId: string
}

export function BookDetail({ book, ratings, notes, collections, memberCollectionIds, userId }: Props) {
  const [status, setStatus] = useState<ReadingStatus>(book.reading_status)
  const [owned, setOwned] = useState(book.owned)
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
    setSavingNote(true)
    const supabase = createClient()
    const { data } = await supabase.from('notes').insert({ book_id: book.id, user_id: userId, body: noteText.trim() }).select().single()
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

  const spice = localRatings['spice'] ?? 0

  const heroWash = `linear-gradient(180deg, ${coverGradient(book.id).match(/#[A-Fa-f0-9]{6}/g)?.[1] ?? '#E9DAC6'} 0%, var(--cream) 78%)`

  /* ── Shared inner panels ── */
  const statusAndSavePanel = (
    <>
      <div style={{ display: 'flex', gap: 4, background: '#F0E8D8', borderRadius: 15, padding: 4 }}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '9px 0',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all .2s',
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
          display: 'block',
          width: '100%',
          marginTop: 12,
          background: 'var(--ink)',
          color: 'var(--cream)',
          border: 'none',
          borderRadius: 12,
          padding: '11px 0',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          opacity: saving ? 0.6 : 1,
          fontFamily: 'var(--font-mulish), sans-serif',
        }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </>
  )

  const descriptionPanel = book.description ? (
    <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '18px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 10 }}>About</div>
      <p style={{ fontSize: 14, color: '#5a4a42', lineHeight: 1.65 }}>{book.description}</p>
    </div>
  ) : null

  const ratingsPanel = (
    <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '22px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 18 }}>
        How was it?
      </div>
      {RATING_CATEGORIES.map(({ key, label }, i) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: i < RATING_CATEGORIES.length - 1 ? 16 : 0,
          }}
        >
          <span style={{ fontSize: 14, color: '#7a6a5e', fontWeight: 500 }}>{label}</span>
          <div style={{ display: 'flex' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setRating(key, n)}
                style={{
                  fontSize: 26,
                  cursor: 'pointer',
                  lineHeight: 1,
                  color: (localRatings[key] ?? 0) >= n ? '#E0A24A' : '#E7DCCB',
                  transition: 'color .15s',
                  marginRight: 3,
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      ))}

      <div style={{ height: 1, background: 'rgba(150,130,110,0.12)', margin: '18px -2px 16px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, color: '#7a6a5e', fontWeight: 500 }}>Spice</div>
          {spice > 0 && (
            <div style={{ fontSize: 11, color: '#C9A18A', marginTop: 2, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>
              {SPICE_LABELS[spice]}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setRating('spice', n)}
              style={{
                fontSize: 22,
                cursor: 'pointer',
                lineHeight: 1,
                marginRight: 4,
                transition: 'all .15s',
                filter: spice >= n ? 'none' : 'grayscale(0.9)',
                opacity: spice >= n ? 1 : 0.32,
              }}
            >
              🌶️
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const notesPanel = (
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
        style={{
          width: '100%',
          minHeight: 96,
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: 15,
          color: '#5a4a42',
          background: 'transparent',
        }}
      />
      <button
        onClick={addNote}
        disabled={savingNote || !noteText.trim()}
        style={{
          marginTop: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 99,
          fontSize: 12.5,
          fontWeight: 600,
          background: 'var(--ink)',
          color: 'var(--cream)',
          border: 'none',
          cursor: noteText.trim() ? 'pointer' : 'default',
          opacity: noteText.trim() ? 1 : 0.4,
          fontFamily: 'var(--font-mulish), sans-serif',
        }}
      >
        {savingNote ? 'Saving…' : 'Add note'}
      </button>

      {localNotes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {localNotes.map((note) => (
            <div key={note.id} style={{ background: 'rgba(255,253,248,0.8)', borderRadius: 12, padding: '12px 14px', position: 'relative' }}>
              <p style={{ fontSize: 14, color: '#5a4a42', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{note.body}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#B3A595' }}>{new Date(note.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{ fontSize: 11, color: '#B3A595', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const collectionsPanel = collections.length > 0 ? (
    <div style={{ marginTop: 22, background: 'var(--card)', borderRadius: 22, padding: '22px 20px', border: '1px solid rgba(150,130,110,0.08)' }}>
      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 16 }}>
        In your shelves
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {collections.map((col) => {
          const isMember = collectionIds.has(col.id)
          return (
            <button
              key={col.id}
              onClick={() => toggleCollection(col.id)}
              disabled={togglingCol === col.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .2s',
                background: isMember ? '#E7EEE0' : 'var(--card)',
                color: isMember ? 'var(--sage)' : 'var(--ink-light)',
                border: `1px solid ${isMember ? 'rgba(120,150,110,0.4)' : 'rgba(150,130,110,0.16)'}`,
                fontFamily: 'var(--font-mulish), sans-serif',
              }}
            >
              {col.name}
            </button>
          )
        })}
      </div>
    </div>
  ) : null

  const deletePanel = (
    <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid rgba(150,130,110,0.14)' }}>
      <button
        onClick={deleteBook}
        disabled={deleting}
        style={{
          background: 'transparent',
          border: '1px solid rgba(150,130,110,0.22)',
          borderRadius: 12,
          padding: '10px 18px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink-light)',
          cursor: 'pointer',
          opacity: deleting ? 0.5 : 1,
          fontFamily: 'var(--font-mulish), sans-serif',
        }}
      >
        {deleting ? 'Deleting…' : 'Delete book'}
      </button>
    </div>
  )

  /* ── Mobile layout (< md) ── */
  const mobileLayout = (
    <div className="md:hidden" style={{ paddingBottom: 40 }}>
      {/* Hero */}
      <div style={{ position: 'relative', padding: '62px 22px 26px', background: heroWash, overflow: 'hidden' }}>
        <a
          href="/library"
          style={{
            position: 'absolute', top: 58, left: 18, zIndex: 5, width: 38, height: 38,
            borderRadius: 99, background: 'rgba(255,253,248,0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
            boxShadow: '0 4px 10px -5px rgba(90,72,55,0.4)', textDecoration: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
        </a>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 12 }}>
          <div style={{ width: 172, height: 258, borderRadius: 16, overflow: 'hidden', boxShadow: '0 26px 44px -20px rgba(90,72,55,0.55)' }}>
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: coverGradient(book.id), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px 20px' }}>
                <div />
                <div>
                  <div style={{ width: 30, height: 2, background: 'rgba(74,61,53,0.4)', margin: '0 auto 12px' }} />
                  <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 24, lineHeight: 1.1, color: '#3a2e27', fontWeight: 600 }}>{book.title}</div>
                  {book.author && <div style={{ fontSize: 11, color: 'rgba(74,61,53,0.65)', marginTop: 8, fontStyle: 'italic', letterSpacing: '0.6px' }}>{book.author}</div>}
                </div>
              </div>
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 25, color: 'var(--ink)', fontWeight: 500, marginTop: 22, lineHeight: 1.15, maxWidth: 300 }}>{book.title}</div>
          {book.author && <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 4, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif' }}>by {book.author}</div>}

          <button
            onClick={() => setOwned(!owned)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, padding: '8px 16px',
              borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              border: owned ? '1px solid rgba(120,150,110,0.35)' : '1px solid rgba(200,170,130,0.3)',
              background: owned ? '#E7EEE0' : 'var(--accent-light)', color: owned ? 'var(--sage)' : '#C9A18A', transition: 'all .2s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            {owned ? 'On your shelf' : 'On your wishlist'}
          </button>
        </div>
      </div>

      <div style={{ padding: '4px 22px 0', marginTop: 6 }}>
        {statusAndSavePanel}
        {descriptionPanel}
        {ratingsPanel}
        {notesPanel}
        {collectionsPanel}
        {deletePanel}
      </div>
    </div>
  )

  /* ── Desktop layout (≥ md) ── */
  const desktopLayout = (
    <div className="hidden md:flex" style={{ minHeight: '100vh' }}>
      {/* Left panel — sticky cover + meta */}
      <div style={{
        width: 320, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        background: heroWash, borderRight: '1px solid rgba(150,130,110,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 28px 40px',
      }}>
        <a
          href="/library"
          style={{
            alignSelf: 'flex-start', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, color: 'var(--ink-light)', fontWeight: 600, textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
          Library
        </a>

        <div style={{ width: 200, height: 300, borderRadius: 18, overflow: 'hidden', boxShadow: '0 26px 44px -20px rgba(90,72,55,0.55)', flexShrink: 0 }}>
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: coverGradient(book.id), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px 20px' }}>
              <div />
              <div>
                <div style={{ width: 30, height: 2, background: 'rgba(74,61,53,0.4)', margin: '0 auto 12px' }} />
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, lineHeight: 1.1, color: '#3a2e27', fontWeight: 600, textAlign: 'center' }}>{book.title}</div>
                {book.author && <div style={{ fontSize: 11, color: 'rgba(74,61,53,0.65)', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>{book.author}</div>}
              </div>
            </div>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginTop: 22, lineHeight: 1.2, textAlign: 'center' }}>{book.title}</div>
        {book.author && <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 4, fontStyle: 'italic', fontFamily: 'var(--font-newsreader), serif', textAlign: 'center' }}>by {book.author}</div>}

        <button
          onClick={() => setOwned(!owned)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, padding: '8px 16px',
            borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: owned ? '1px solid rgba(120,150,110,0.35)' : '1px solid rgba(200,170,130,0.3)',
            background: owned ? '#E7EEE0' : 'var(--accent-light)', color: owned ? 'var(--sage)' : '#C9A18A', transition: 'all .2s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          {owned ? 'On your shelf' : 'On your wishlist'}
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 32 }}>
          <button
            onClick={deleteBook}
            disabled={deleting}
            style={{
              background: 'transparent', border: '1px solid rgba(150,130,110,0.22)', borderRadius: 12,
              padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--ink-light)',
              cursor: 'pointer', opacity: deleting ? 0.5 : 1, fontFamily: 'var(--font-mulish), sans-serif',
            }}
          >
            {deleting ? 'Deleting…' : 'Delete book'}
          </button>
        </div>
      </div>

      {/* Right panel — scrollable journal content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 60px' }}>
        {statusAndSavePanel}
        {descriptionPanel}
        {ratingsPanel}
        {notesPanel}
        {collectionsPanel}
      </div>
    </div>
  )

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  )
}
