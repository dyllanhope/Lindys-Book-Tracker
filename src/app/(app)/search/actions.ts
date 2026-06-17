'use server'

import { createClient } from '@/lib/supabase/server'
import { importExternalBook } from '@/lib/books/import'
import { revalidatePath } from 'next/cache'
import type { ExternalBook } from '@/lib/types'

export type ImportResult = { id: string } | { error: string }

/**
 * Import a search result into the user's library. Returns the new book id (or an
 * error) so the client can update a single card in place without a page reload.
 */
export async function importSearchResult(book: ExternalBook): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const result = await importExternalBook(supabase, user.id, {
    title: book.title,
    author: book.author || null,
    isbn: book.isbn || null,
    description: book.description || null,
    coverUrl: book.coverUrl || null,
    source: book.source,
    externalId: book.externalId,
    categories: book.categories ?? [],
  })
  if ('error' in result) return { error: result.error }

  revalidatePath('/library')
  return { id: result.id }
}
