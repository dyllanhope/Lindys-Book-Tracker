import { searchGoogleBooks } from './googleBooks'
import { searchOpenLibrary } from './openLibrary'
import type { ExternalBook } from '@/lib/types'

export async function searchBooks(query: string): Promise<ExternalBook[]> {
  if (!query.trim()) return []

  try {
    const googleResults = await searchGoogleBooks(query)
    if (googleResults.length > 0) return googleResults
  } catch {
    // fall through to Open Library
  }

  try {
    return await searchOpenLibrary(query)
  } catch {
    return []
  }
}
