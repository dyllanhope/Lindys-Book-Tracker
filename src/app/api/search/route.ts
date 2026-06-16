import { searchBooks } from '@/lib/books/search'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json([])

  const results = await searchBooks(q)
  return NextResponse.json(results)
}
