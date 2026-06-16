import type { ExternalBook } from '@/lib/types'

interface GoogleVolume {
  id: string
  volumeInfo: {
    title?: string
    authors?: string[]
    industryIdentifiers?: { type: string; identifier: string }[]
    description?: string
    imageLinks?: { thumbnail?: string }
  }
}

export async function searchGoogleBooks(query: string): Promise<ExternalBook[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
  const res = await fetch(url, { next: { revalidate: 60 } })
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
    }
  })
}
