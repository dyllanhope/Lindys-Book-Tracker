import type { SupabaseClient } from '@supabase/supabase-js'
import type { ExternalSource } from '@/lib/types'
import { findOrCreateTag } from '@/lib/tags'
import { getOpenLibraryWork } from './openLibrary'
import { getGoogleVolume } from './googleBooks'

export interface ImportInput {
  title: string
  author: string | null
  isbn: string | null
  description: string | null
  coverUrl: string | null
  source: ExternalSource
  externalId: string
  categories: string[] // genres already known (Google provides these in search)
  pageCount: number | null
}

/** Resolve genre names to tags and attach them to a book, in parallel. */
async function attachGenres(
  supabase: SupabaseClient,
  userId: string,
  bookId: string,
  genres: string[],
): Promise<void> {
  await Promise.all(
    genres.map(async (name) => {
      const tag = await findOrCreateTag(supabase, userId, name, 'genre')
      if (tag) await supabase.from('book_tags').insert({ book_id: bookId, tag_id: tag.id })
    }),
  )
}

/**
 * Insert an external book for a user using only the data already in hand, and
 * attach any genres the search result carried. This does NOT make any external
 * API calls, so it returns as soon as the row is written — keeping "Add to
 * Library" snappy. Call {@link enrichImportedBook} afterwards (e.g. via `after`)
 * to backfill the blurb and genres that require a detail fetch.
 */
export async function importExternalBook(
  supabase: SupabaseClient,
  userId: string,
  input: ImportInput,
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: userId,
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      description: input.description,
      cover_url: input.coverUrl,
      external_source: input.source,
      external_id: input.externalId,
      page_count: input.pageCount,
    })
    .select('id')
    .single()
  if (error || !data) return { error: error?.message ?? 'Insert failed' }

  await attachGenres(supabase, userId, data.id, input.categories)
  return { id: data.id }
}

/**
 * Best-effort background enrichment for a freshly imported book. Search results
 * arrive without a blurb or genres — OpenLibrary needs the Work detail and
 * Google's search payload strips down to a coarse category — so we fetch the
 * detail here and backfill the description (if still empty) and genres (if none
 * were attached yet). Safe to run after the response has been sent.
 */
export async function enrichImportedBook(
  supabase: SupabaseClient,
  userId: string,
  bookId: string,
  input: ImportInput,
): Promise<void> {
  let description: string | null = null
  let genres: string[] = []
  let pageCount: number | null = null

  try {
    if (input.source === 'openlibrary') {
      const work = await getOpenLibraryWork(input.externalId)
      if (work) {
        if (!input.description) description = work.description
        genres = work.genres
      }
    } else if (input.source === 'google') {
      const full = await getGoogleVolume(input.externalId)
      if (full) {
        if (!input.description) description = full.description
        genres = full.categories
        if (input.pageCount == null) pageCount = full.pageCount
      }
    }
  } catch {
    // enrichment is best-effort; leave the book with whatever it already has
    return
  }

  const patch: { description?: string; page_count?: number } = {}
  if (description) patch.description = description
  if (pageCount != null) patch.page_count = pageCount
  if (Object.keys(patch).length > 0) {
    await supabase.from('books').update(patch).eq('id', bookId)
  }
  // Only backfill genres when the import carried none of its own.
  if (input.categories.length === 0 && genres.length > 0) {
    await attachGenres(supabase, userId, bookId, genres)
  }
}
