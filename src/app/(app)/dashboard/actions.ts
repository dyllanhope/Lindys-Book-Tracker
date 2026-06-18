'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/** Set (or clear) the signed-in user's reading goal for a given year. */
export async function setReadingGoal(year: number, target: number | null): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  if (target == null || target <= 0) {
    await supabase.from('reading_goals').delete().eq('user_id', user.id).eq('year', year)
  } else {
    const { error } = await supabase
      .from('reading_goals')
      .upsert({ user_id: user.id, year, target, updated_at: new Date().toISOString() }, { onConflict: 'user_id,year' })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
