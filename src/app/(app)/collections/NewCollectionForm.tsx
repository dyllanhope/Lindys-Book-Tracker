import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function createCollection(formData: FormData) {
  'use server'
  const name = (formData.get('name') as string).trim()
  if (!name) redirect('/collections?error=Name+is+required')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { error } = await supabase.from('collections').insert({ name, user_id: user.id })
  if (error) redirect(`/collections?error=${encodeURIComponent(error.message)}`)
  redirect('/collections')
}

export function NewCollectionForm({ error }: { error?: string }) {
  return (
    <form action={createCollection} className="flex gap-2 max-w-sm">
      <input
        name="name"
        placeholder="Collection name…"
        required
        className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap">
        Create
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{decodeURIComponent(error)}</p>}
    </form>
  )
}
