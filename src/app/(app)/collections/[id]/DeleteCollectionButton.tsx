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
      className="rounded-lg bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
