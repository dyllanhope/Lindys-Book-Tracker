import type { ExternalBook } from '@/lib/types'
import { fetchWithRetry } from './http'

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

// An API key lifts the very low anonymous quota (which 429s constantly and forces
// the slow Open Library fallback). Set GOOGLE_BOOKS_API_KEY to keep the fast path.
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY
function withKey(url: string): string {
  if (!API_KEY) return url
  return url + (url.includes('?') ? '&' : '?') + `key=${API_KEY}`
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

function volumeToExternalBook(item: GoogleVolume): ExternalBook {
  const info = item.volumeInfo
  const isbn = info.industryIdentifiers?.find(
    (i) => i.type === 'ISBN_13' || i.type === 'ISBN_10'
  )?.identifier ?? null
  const cover = (info.imageLinks?.thumbnail ?? null)?.replace('http:', 'https:') ?? null
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
}

/** Fetch a single Google volume by id (full volumeInfo). Throws on 429 like search. */
export async function getGoogleVolume(id: string): Promise<ExternalBook | null> {
  const res = await fetchWithRetry(withKey(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`), {
    next: { revalidate: 3600 },
  })
  if (res.status === 429) throw new Error('Google Books quota exceeded (429)')
  if (!res.ok) return null
  const item = (await res.json()) as GoogleVolume
  return volumeToExternalBook(item)
}

interface SearchOpts { author?: string; page?: number; pageSize?: number }

export async function searchGoogleBooks(query: string, opts: SearchOpts = {}): Promise<ExternalBook[]> {
  const pageSize = opts.pageSize ?? 10
  const startIndex = ((opts.page ?? 1) - 1) * pageSize

  // Combine the free-text title query with an optional `inauthor:` qualifier so
  // an author can narrow results to a specific writer.
  const terms: string[] = []
  if (query.trim()) terms.push(query.trim())
  if (opts.author?.trim()) terms.push(`inauthor:"${opts.author.trim()}"`)
  const q = terms.join(' ')

  const url = withKey(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&startIndex=${startIndex}&maxResults=${pageSize}`)
  const res = await fetchWithRetry(url, { next: { revalidate: 60 } })
  // Throw on rate limiting so callers can distinguish "quota hit" from "no results"
  // and fall back to another source.
  if (res.status === 429) throw new Error('Google Books quota exceeded (429)')
  if (!res.ok) return []

  const data = await res.json()
  const items: GoogleVolume[] = data.items ?? []

  return items.map(volumeToExternalBook)
}
