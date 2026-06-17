'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SHELF_COLORS, DEFAULT_SHELF_COLOR } from '@/lib/shelfColors'

function safeColor(value: FormDataEntryValue | null): string {
  const c = (value as string) ?? ''
  return SHELF_COLORS.includes(c) ? c : DEFAULT_SHELF_COLOR
}

export async function createCollection(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  if (!name) redirect('/collections?error=Name+is+required')
  const color = safeColor(formData.get('color'))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { error } = await supabase.from('collections').insert({ name, user_id: user.id, color })
  if (error) redirect(`/collections?error=${encodeURIComponent(error.message)}`)
  redirect('/collections')
}

export async function updateCollectionColor(formData: FormData) {
  const id = formData.get('id') as string
  const color = safeColor(formData.get('color'))
  const supabase = await createClient()
  await supabase.from('collections').update({ color }).eq('id', id)
  revalidatePath(`/collections/${id}`)
  revalidatePath('/collections')
}
