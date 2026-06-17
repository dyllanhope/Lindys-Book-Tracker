import type { ExternalBook } from '@/lib/types'

interface GoogleVolume {
  id: string
  volumeInfo: {
    title?: string
    authors?: string[]
    industryIdentifiers?: { type: string; identifier: string }[]
    description?: string
    imageLinks?: { thumbnail?: string }
    categories?: string[]
  }
}

// Google returns slash-delimited paths like "Fiction / Fantasy / Epic".
// Flatten to individual genre names, drop overly-generic buckets, and dedupe.
const GENRE_STOPLIST = new Set(['fiction', 'nonfiction', 'non-fiction', 'general'])

function parseCategories(categories: string[] | undefined): string[] {
  if (!categories) return []
  const out = new Map<string, string>() // lowercase -> display form
  for (const raw of categories) {
    for (const part of raw.split('/')) {
      const name = part.trim()
      const key = name.toLowerCase()
      if (name && !GENRE_STOPLIST.has(key) && !out.has(key)) out.set(key, name)
    }
  }
  return [...out.values()]
}

export async function searchGoogleBooks(query: string): Promise<ExternalBook[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
  const res = await fetch(url, { next: { revalidate: 60 } })
  // Throw on rate limiting so callers can distinguish "quota hit" from "no results"
  // and fall back to another source.
  if (res.status === 429) throw new Error('Google Books quota exceeded (429)')
  if (!res.ok) return []

  const data = await res.json()
  const items: GoogleVolume[] = data.items ?? []

  return items.map((item) => {
    const info = item.volumeInfo
    const isbn = info.industryIdentifiers?.find(
      (i) => i.type === 'ISBN_13' || i.type === 'ISBN_10'
    )?.identifier ?? null
    const cover = info.imageLinks?.thumbnail?.replace('http:', 'https:') ?? null
    return {
      title: info.title ?? 'Unknown Title',
      author: info.authors?.join(', ') ?? '',
      isbn,
      description: info.description ?? null,
      coverUrl: cover,
      source: 'google' as const,
      externalId: item.id,
      categories: parseCategories(info.categories),
    }
  })
}
