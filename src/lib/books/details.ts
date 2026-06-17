import type { ExternalSource } from '@/lib/types'
import { getGoogleVolume } from './googleBooks'
import { getOpenLibraryWork } from './openLibrary'

export interface ExternalBookDetail {
  source: ExternalSource
  externalId: string // canonical form as stored in the DB (full "/works/OL..W" for OL)
  title: string
  author: string
  description: string | null
  coverUrl: string | null
  isbn: string | null
  genres: string[]
}

/** Clean, slash-free id for use in routes. OpenLibrary -> OLID; Google -> id. */
export function toRouteId(source: ExternalSource, externalId: string): string {
  if (source === 'openlibrary') return externalId.replace(/^\/?(works\/)?/, '')
  return externalId
}

/** Canonical DB external_id from a route id. */
export function toExternalId(source: ExternalSource, routeId: string): string {
  if (source === 'openlibrary') return `/works/${routeId.replace(/^\/?(works\/)?/, '')}`
  return routeId
}

/** Full external details for the preview page, by source + route id. */
export async function getExternalBookDetails(
  source: ExternalSource,
  routeId: string,
): Promise<ExternalBookDetail | null> {
  if (source === 'google') {
    const b = await getGoogleVolume(routeId)
    if (!b) return null
    return {
      source,
      externalId: b.externalId,
      title: b.title,
      author: b.author,
      description: b.description,
      coverUrl: b.coverUrl,
      isbn: b.isbn,
      genres: b.categories,
    }
  }

  if (source === 'openlibrary') {
    const w = await getOpenLibraryWork(routeId)
    if (!w) return null
    return {
      source,
      externalId: toExternalId(source, routeId),
      title: w.title ?? 'Unknown Title',
      author: w.author ?? '',
      description: w.description,
      coverUrl: w.coverUrl,
      isbn: null,
      genres: w.genres,
    }
  }

  return null
}
