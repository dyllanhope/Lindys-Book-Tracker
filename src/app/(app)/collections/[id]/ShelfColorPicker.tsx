'use client'

import { SHELF_COLORS } from '@/lib/shelfColors'
import { updateCollectionColor } from '../actions'

export function ShelfColorPicker({ id, current }: { id: string; current: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
      <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 600, marginRight: 2 }}>Colour</span>
      {SHELF_COLORS.map((c) => (
        <form action={updateCollectionColor} key={c} style={{ display: 'inline-flex' }}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="color" value={c} />
          <button
            type="submit"
            aria-label={`Set colour ${c}`}
            style={{
              width: 22,
              height: 22,
              borderRadius: 99,
              background: c,
              cursor: 'pointer',
              padding: 0,
              border: current === c ? '2px solid var(--ink)' : '2px solid transparent',
              boxShadow: current === c ? '0 0 0 2px var(--cream), 0 0 0 3px rgba(150,130,110,0.3)' : 'none',
              transform: current === c ? 'scale(1.12)' : 'none',
              transition: 'transform .15s',
            }}
          />
        </form>
      ))}
    </div>
  )
}
