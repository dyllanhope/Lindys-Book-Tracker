import { searchGoogleBooks } from './googleBooks'
import { searchOpenLibrary } from './openLibrary'
import type { ExternalBook } from '@/lib/types'

export interface SearchOptions {
  /** Optional author to narrow results to a specific writer. */
  author?: string
  /** 1-based page number. */
  page?: number
  /** Results per page. */
  pageSize?: number
}

export const SEARCH_PAGE_SIZE = 10

export async function searchBooks(query: string, opts: SearchOptions = {}): Promise<ExternalBook[]> {
  const author = opts.author?.trim() ?? ''
  // Need at least a title or an author to search.
  if (!query.trim() && !author) return []

  const page = Math.max(1, opts.page ?? 1)
  const pageSize = opts.pageSize ?? SEARCH_PAGE_SIZE

  try {
    const googleResults = await searchGoogleBooks(query, { author, page, pageSize })
    if (googleResults.length > 0) return googleResults
  } catch (err) {
    // Google failed (e.g. quota/429) — log distinctly, then fall back to Open Library.
    console.warn(`[search] Google Books failed, falling back to Open Library: ${err instanceof Error ? err.message : err}`)
  }

  try {
    return await searchOpenLibrary(query, { author, page, pageSize })
  } catch {
    return []
  }
}
