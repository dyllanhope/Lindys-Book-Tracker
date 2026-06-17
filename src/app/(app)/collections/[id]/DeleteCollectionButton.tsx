'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DeleteCollectionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this collection? Books will not be deleted.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('collections').delete().eq('id', id)
    window.location.href = '/collections'
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: 'transparent',
        border: '1px solid rgba(150,130,110,0.22)',
        borderRadius: 12,
        padding: '8px 14px',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--ink-light)',
        cursor: 'pointer',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? 'Deleting…' : 'Delete shelf'}
    </button>
  )
}
