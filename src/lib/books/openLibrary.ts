import type { ExternalBook } from '@/lib/types'

interface OLDoc {
  key: string
  title?: string
  author_name?: string[]
  isbn?: string[]
  first_sentence?: { value: string } | string
  cover_i?: number
}

export async function searchOpenLibrary(query: string): Promise<ExternalBook[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
  const res = await fetch(url, { next: { revalidate: 60 } })
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
