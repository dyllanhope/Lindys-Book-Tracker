'use server'

import { createClient } from '@/lib/supabase/server'
import { importExternalBook, enrichImportedBook, type ImportInput } from '@/lib/books/import'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import type { ExternalBook } from '@/lib/types'

export type ImportResult = { id: string } | { error: string }

/**
 * Import a search result into the user's library. Returns the new book id (or an
 * error) so the client can update a single card in place without a page reload.
 *
 * The book row is written immediately from the data already in hand, then the
 * slow blurb/genre enrichment (which requires an external detail fetch) runs via
 * `after` so the response — and the user's "Added ✓" — isn't blocked on it.
 */
export async function importSearchResult(book: ExternalBook): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const input: ImportInput = {
    title: book.title,
    author: book.author || null,
    isbn: book.isbn || null,
    description: book.description || null,
    coverUrl: book.coverUrl || null,
    source: book.source,
    externalId: book.externalId,
    categories: book.categories ?? [],
    pageCount: book.pageCount ?? null,
  }

  const result = await importExternalBook(supabase, user.id, input)
  if ('error' in result) return { error: result.error }

  after(async () => {
    await enrichImportedBook(supabase, user.id, result.id, input)
    revalidatePath('/library')
  })

  revalidatePath('/library')
  return { id: result.id }
}
