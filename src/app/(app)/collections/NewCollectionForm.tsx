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

export function NewCollectionForm({ error, compact }: { error?: string; compact?: boolean }) {
  return (
    <div>
      <form action={createCollection} style={{ display: 'flex', gap: 8, maxWidth: compact ? 280 : 340 }}>
        <input
          name="name"
          placeholder="New shelf name…"
          required
          style={{
            flex: 1,
            background: 'var(--card)',
            border: '1px solid rgba(150,130,110,0.22)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 14,
            color: 'var(--ink)',
            outline: 'none',
            fontFamily: 'var(--font-mulish), sans-serif',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Create
        </button>
      </form>
      {error && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b' }}>{decodeURIComponent(error)}</p>
      )}
    </div>
  )
}
