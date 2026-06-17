import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { NewCollectionForm } from './NewCollectionForm'
import type { Collection } from '@/lib/types'

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, color, created_at, user_id')
    .order('name')

  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      <div className="md:flex md:items-end md:justify-between md:mb-8">
        <div>
          <div style={{ fontFamily: 'var(--font-newsreader), serif', color: 'var(--ink)', fontWeight: 400, lineHeight: 1 }} className="text-[30px] md:text-[38px]">
            Your shelves
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 7 }}>
            A little library of your own
          </div>
        </div>
        {/* Desktop: new shelf form inline at top right */}
        <div className="hidden md:block">
          <NewCollectionForm error={error} compact />
        </div>
      </div>

      {/* Mobile: new shelf form below header */}
      <div className="md:hidden" style={{ marginTop: 24 }}>
        <NewCollectionForm error={error} />
      </div>

      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {(collections as Collection[]).map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              style={{
                background: 'var(--card)',
                borderRadius: 24,
                padding: 20,
                textDecoration: 'none',
                border: '1px solid rgba(150,130,110,0.08)',
                borderLeft: `4px solid ${col.color}`,
                boxShadow: '0 14px 28px -22px rgba(120,95,70,0.5)',
                display: 'block',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 11, height: 11, borderRadius: 99, background: col.color, flexShrink: 0 }} />
                <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 21, color: 'var(--ink)', fontWeight: 500 }}>
                  {col.name}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 6 }}>
                View shelf →
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--ink-light)' }}>
          No shelves yet. Create one above.
        </p>
      )}
    </div>
  )
}
