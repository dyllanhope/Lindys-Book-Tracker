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
}

/**
 * Insert an external book for a user and attach genre tags.
 * OpenLibrary search results lack a blurb and subjects, so we fetch the Work
 * detail to enrich description + genres before inserting.
 */
export async function importExternalBook(
  supabase: SupabaseClient,
  userId: string,
  input: ImportInput,
): Promise<{ id: string } | { error: string }> {
  let description = input.description
  let genres = input.categories

  if (input.source === 'openlibrary') {
    try {
      const work = await getOpenLibraryWork(input.externalId)
      if (work) {
        if (!description) description = work.description
        if (genres.length === 0) genres = work.genres
      }
    } catch {
      // enrichment is best-effort; proceed with whatever we have
    }
  } else if (input.source === 'google' && genres.length === 0) {
    // Google's search endpoint returns only a coarse category (e.g. "Fiction",
    // which we strip), so a quick-add carries no genres. The full volume detail
    // has the rich BISAC list — fetch it so genres still transfer.
    try {
      const full = await getGoogleVolume(input.externalId)
      if (full) {
        if (!description) description = full.description
        if (full.categories.length > 0) genres = full.categories
      }
    } catch {
      // best-effort; proceed with whatever we have
    }
  }

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: userId,
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      description,
      cover_url: input.coverUrl,
      external_source: input.source,
      external_id: input.externalId,
    })
    .select('id')
    .single()
  if (error || !data) return { error: error?.message ?? 'Insert failed' }

  for (const name of genres) {
    const tag = await findOrCreateTag(supabase, userId, name, 'genre')
    if (tag) await supabase.from('book_tags').insert({ book_id: data.id, tag_id: tag.id })
  }
  return { id: data.id }
}
