'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateBookDetails(formData: FormData) {
  const supabase = await createClient()
  const bookId = formData.get('bookId') as string
  await supabase.from('books').update({
    reading_status: formData.get('reading_status') as string,
    owned: formData.get('owned') === 'on',
    date_started: (formData.get('date_started') as string) || null,
    date_finished: (formData.get('date_finished') as string) || null,
  }).eq('id', bookId)
  redirect(`/books/${bookId}?saved=1`)
}

export async function setRating(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const bookId = formData.get('bookId') as string
  await supabase.from('ratings').upsert({
    book_id: bookId,
    user_id: user.id,
    category: formData.get('category') as string,
    score: parseInt(formData.get('score') as string, 10),
  }, { onConflict: 'book_id,category' })
  redirect(`/books/${bookId}`)
}

export async function addNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const bookId = formData.get('bookId') as string
  const body = (formData.get('body') as string).trim()
  if (body) {
    await supabase.from('notes').insert({ book_id: bookId, user_id: user.id, body })
  }
  redirect(`/books/${bookId}`)
}

export async function deleteNote(formData: FormData) {
  const supabase = await createClient()
  const bookId = formData.get('bookId') as string
  await supabase.from('notes').delete().eq('id', formData.get('noteId') as string)
  redirect(`/books/${bookId}`)
}

export async function toggleCollection(formData: FormData) {
  const supabase = await createClient()
  const bookId = formData.get('bookId') as string
  const collectionId = formData.get('collectionId') as string
  if (formData.get('action') === 'remove') {
    await supabase.from('collection_books').delete().eq('collection_id', collectionId).eq('book_id', bookId)
  } else {
    await supabase.from('collection_books').insert({ collection_id: collectionId, book_id: bookId })
  }
  redirect(`/books/${bookId}`)
}

export async function deleteBook(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('books').delete().eq('id', formData.get('bookId') as string)
  redirect('/library')
}
