import { searchBooks, SEARCH_PAGE_SIZE } from '@/lib/books/search'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Book } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const author = searchParams.get('author') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  if (!q.trim() && !author.trim()) {
    return NextResponse.json({ results: [], owned: {}, hasMore: false })
  }

  const results = await searchBooks(q, { author, page, pageSize: SEARCH_PAGE_SIZE })

  // Map which of these results the signed-in user already owns (external_id -> book).
  let owned: Record<string, Book> = {}
  if (results.length > 0) {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('books')
      .select('*')
      .in('external_id', results.map((r) => r.externalId))
    owned = Object.fromEntries(((existing ?? []) as Book[]).map((b) => [b.external_id!, b]))
  }

  // A full page implies there may be another one to fetch.
  const hasMore = results.length === SEARCH_PAGE_SIZE
  return NextResponse.json({ results, owned, hasMore })
}
