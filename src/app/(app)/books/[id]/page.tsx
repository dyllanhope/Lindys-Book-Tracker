import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BookDetail } from './BookDetail'
import type { Book, Rating, Note, Collection, Tag } from '@/lib/types'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [
    { data: book },
    { data: ratings },
    { data: notes },
    { data: allCollections },
    { data: bookCollections },
    { data: bookTagRows },
    { data: allTags },
  ] = await Promise.all([
    supabase.from('books').select('*').eq('id', id).single(),
    supabase.from('ratings').select('*').eq('book_id', id),
    supabase.from('notes').select('*').eq('book_id', id).order('created_at', { ascending: false }),
    supabase.from('collections').select('*').order('name'),
    supabase.from('collection_books').select('collection_id').eq('book_id', id),
    supabase.from('book_tags').select('tags(*)').eq('book_id', id),
    supabase.from('tags').select('*').order('name'),
  ])

  if (!book) notFound()

  const memberIds = (bookCollections ?? []).map((cb) => cb.collection_id)
  const bookTags = ((bookTagRows ?? []) as unknown as { tags: Tag | null }[])
    .map((r) => r.tags)
    .filter((t): t is Tag => t !== null)

  return (
    <BookDetail
      book={book as Book}
      ratings={(ratings ?? []) as Rating[]}
      notes={(notes ?? []) as Note[]}
      collections={(allCollections ?? []) as Collection[]}
      memberCollectionIds={memberIds}
      bookTags={bookTags}
      allTags={(allTags ?? []) as Tag[]}
      userId={user.id}
    />
  )
}
