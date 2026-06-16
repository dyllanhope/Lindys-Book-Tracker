import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { NewCollectionForm } from './NewCollectionForm'
import type { Collection } from '@/lib/types'

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, created_at')
    .order('name')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-stone-800">Collections</h1>
      <NewCollectionForm error={error} />
      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(collections as Collection[]).map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:border-indigo-300 transition-colors"
            >
              <p className="text-xl mb-1">📂</p>
              <p className="font-medium text-stone-800">{col.name}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-stone-400 text-sm">No collections yet. Create one above.</p>
      )}
    </div>
  )
}
