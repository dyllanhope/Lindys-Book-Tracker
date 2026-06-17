import type { ExternalBook } from '@/lib/types'
import { fetchWithRetry } from './http'

interface OLDoc {
  key: string
  title?: string
  author_name?: string[]
  isbn?: string[]
  first_sentence?: { value: string } | string
  cover_i?: number
}

// OpenLibrary throttles requests without a descriptive User-Agent, so identify the app.
// https://openlibrary.org/developers/api
const USER_AGENT = "LindysBookTracker/1.0 (https://github.com/dyllanhope/Lindys-Book-Tracker)"

// OpenLibrary subjects are noisy (catalog cruft, NYT tags, identifiers). Keep only
// clean, genre-like terms.
const SUBJECT_STOP = /\d|[:=()]|^fiction$|^nonfiction$|^non-fiction$|^general$|accessible book|protected daisy|in library|reading level|large type|lending library|new york times|nyt|bestseller|open library|internet archive|overdrive|award|translations into/i

// OpenLibrary descriptions are user-submitted and often carry markdown link spam
// and reference definitions. Strip those so the blurb reads as plain prose.
export function cleanDescription(desc: string | null): string | null {
  if (!desc) return null
  const cleaned = desc
    .replace(/^\s*\[\d+\]:\s*\S+.*$/gm, '')      // reference-style link definitions
    .replace(/\(\[[^\]]+\]\[\d+\]\)/g, '')         // ([source][1])
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')       // [text](url) -> text
    .replace(/\[([^\]]+)\]\[\d+\]/g, '$1')         // [text][1] -> text
    .replace(/\*\*/g, '')                           // bold markers
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return cleaned || null
}

export function curateSubjects(subjects: string[] | undefined, cap = 6): string[] {
  if (!subjects) return []
  const out = new Map<string, string>() // lowercase key -> Title Case display
  for (const raw of subjects) {
    const s = raw.trim()
    if (!s || s.length > 28 || s.includes(',')) continue
    if (SUBJECT_STOP.test(s)) continue
    const key = s.toLowerCase()
    if (!out.has(key)) out.set(key, s.replace(/\b\w/g, (c) => c.toUpperCase()))
    if (out.size >= cap) break
  }
  return [...out.values()]
}

interface OLWork {
  title?: string
  description?: string | { value: string }
  subjects?: string[]
  covers?: number[]
  authors?: { author?: { key?: string } }[]
}

export interface OpenLibraryWorkDetail {
  title: string | null
  author: string | null
  description: string | null
  genres: string[]
  coverUrl: string | null
}

/** Accepts "OL123W", "works/OL123W", or "/works/OL123W". */
function toWorkOlid(olid: string): string {
  return olid.replace(/^\/?(works\/)?/, '')
}

/** Fetch an OpenLibrary Work: blurb, curated genres, cover, and (best-effort) author. */
export async function getOpenLibraryWork(olid: string): Promise<OpenLibraryWorkDetail | null> {
  const key = toWorkOlid(olid)
  const res = await fetchWithRetry(`https://openlibrary.org/works/${key}.json`, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  const w = (await res.json()) as OLWork

  const rawDescription = typeof w.description === 'string' ? w.description : w.description?.value ?? null
  const description = cleanDescription(rawDescription)
  const firstCover = w.covers?.find((c) => c > 0)
  const coverUrl = firstCover ? `https://covers.openlibrary.org/b/id/${firstCover}-L.jpg` : null

  // Author is a reference; resolve the first one's name (best-effort).
  let author: string | null = null
  const authorKey = w.authors?.[0]?.author?.key
  if (authorKey) {
    try {
      const ar = await fetchWithRetry(`https://openlibrary.org${authorKey}.json`, {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': USER_AGENT },
      })
      if (ar.ok) author = ((await ar.json()) as { name?: string }).name ?? null
    } catch { /* leave author null */ }
  }

  return { title: w.title ?? null, author, description, genres: curateSubjects(w.subjects), coverUrl }
}

export async function searchOpenLibrary(query: string): Promise<ExternalBook[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
  const res = await fetchWithRetry(url, { next: { revalidate: 60 }, headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return []

  const data = await res.json()
  const docs: OLDoc[] = data.docs ?? []

  return docs.map((doc) => {
    const isbn = doc.isbn?.[0] ?? null
    const cover = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null
    const description =
      typeof doc.first_sentence === 'string'
        ? doc.first_sentence
        : doc.first_sentence?.value ?? null

    return {
      title: doc.title ?? 'Unknown Title',
      author: doc.author_name?.join(', ') ?? '',
      isbn,
      description,
      coverUrl: cover,
      source: 'openlibrary' as const,
      externalId: doc.key,
      categories: [], // OpenLibrary subjects are too noisy to auto-tag; add tags manually
    }
  })
}
