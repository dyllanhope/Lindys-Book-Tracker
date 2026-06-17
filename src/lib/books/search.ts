import { searchGoogleBooks } from './googleBooks'
import { searchOpenLibrary } from './openLibrary'
import type { ExternalBook } from '@/lib/types'

export async function searchBooks(query: string): Promise<ExternalBook[]> {
  if (!query.trim()) return []

  try {
    const googleResults = await searchGoogleBooks(query)
    if (googleResults.length > 0) return googleResults
  } catch (err) {
    // Google failed (e.g. quota/429) — log distinctly, then fall back to Open Library.
    console.warn(`[search] Google Books failed, falling back to Open Library: ${err instanceof Error ? err.message : err}`)
  }

  try {
    return await searchOpenLibrary(query)
  } catch {
    return []
  }
}
