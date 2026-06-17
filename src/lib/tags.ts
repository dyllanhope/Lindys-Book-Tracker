import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tag, TagCategory } from '@/lib/types'

export const TAG_CATEGORIES: { value: TagCategory; label: string }[] = [
  { value: 'genre', label: 'Genre' },
  { value: 'format', label: 'Format' },
  { value: 'mood', label: 'Mood' },
  { value: 'custom', label: 'Custom' },
]

export const TAG_CATEGORY_LABEL: Record<TagCategory, string> = {
  genre: 'Genre',
  format: 'Format',
  mood: 'Mood',
  custom: 'Custom',
}

// Warm-linen palette per category, for chip styling.
export const TAG_CATEGORY_STYLE: Record<TagCategory, { bg: string; fg: string; border: string }> = {
  genre: { bg: '#EAF0E3', fg: '#6f8a6c', border: 'rgba(120,150,110,0.4)' },
  format: { bg: '#F3EAFB', fg: '#8a6ca0', border: 'rgba(150,120,170,0.35)' },
  mood: { bg: '#FBEFE4', fg: '#c08a5a', border: 'rgba(200,150,110,0.4)' },
  custom: { bg: '#F0E8D8', fg: '#7a6a5e', border: 'rgba(150,130,110,0.3)' },
}

/**
 * Find an existing tag (case-insensitive, scoped to user + category) or create it.
 * Returns the tag, or null if it could not be resolved.
 */
export async function findOrCreateTag(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  category: TagCategory,
): Promise<Tag | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  // Try existing first (ilike with no wildcards = case-insensitive exact match).
  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .ilike('name', trimmed)
    .limit(1)
    .maybeSingle()
  if (existing) return existing as Tag

  const { data: created, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: trimmed, category })
    .select()
    .single()
  if (created) return created as Tag

  // Lost a race against the unique index — re-fetch the winner.
  if (error) {
    const { data: raced } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .ilike('name', trimmed)
      .limit(1)
      .maybeSingle()
    if (raced) return raced as Tag
  }
  return null
}

/** Map of book_id -> tags, for a set of books. */
export async function getTagsForBooks(
  supabase: SupabaseClient,
  bookIds: string[],
): Promise<Record<string, Tag[]>> {
  if (bookIds.length === 0) return {}
  const { data } = await supabase
    .from('book_tags')
    .select('book_id, tags(*)')
    .in('book_id', bookIds)

  const map: Record<string, Tag[]> = {}
  for (const row of (data ?? []) as unknown as { book_id: string; tags: Tag | null }[]) {
    if (!row.tags) continue
    ;(map[row.book_id] ??= []).push(row.tags)
  }
  return map
}

/**
 * Resolve which books match the selected tag filters.
 * Each group is OR-ed internally; groups are AND-ed together (intersection).
 * Returns null when no tag filter is active.
 */
export async function bookIdsForTagGroups(
  supabase: SupabaseClient,
  groups: string[][],
): Promise<Set<string> | null> {
  const active = groups.filter((g) => g.length > 0)
  if (active.length === 0) return null

  let intersection: Set<string> | null = null
  for (const group of active) {
    const { data } = await supabase
      .from('book_tags')
      .select('book_id')
      .in('tag_id', group)
    const ids = new Set<string>((data ?? []).map((r) => (r as { book_id: string }).book_id))
    if (intersection === null) {
      intersection = ids
    } else {
      const prev: Set<string> = intersection
      intersection = new Set<string>([...prev].filter((id) => ids.has(id)))
    }
    if (intersection.size === 0) break
  }
  return intersection
}
