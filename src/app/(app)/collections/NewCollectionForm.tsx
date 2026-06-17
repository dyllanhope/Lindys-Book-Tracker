'use client'

import { useState } from 'react'
import { createCollection } from './actions'
import { CustomColorSwatch } from './CustomColorSwatch'
import { SHELF_COLORS, DEFAULT_SHELF_COLOR } from '@/lib/shelfColors'

export function NewCollectionForm({ error, compact }: { error?: string; compact?: boolean }) {
  const [color, setColor] = useState(DEFAULT_SHELF_COLOR)

  return (
    <div>
      <form action={createCollection} style={{ maxWidth: compact ? 320 : 380 }}>
        <div style={{ display: 'flex', gap: 8 }}>
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
        </div>
        <input type="hidden" name="color" value={color} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {SHELF_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              onClick={() => setColor(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 99,
                background: c,
                cursor: 'pointer',
                padding: 0,
                border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                boxShadow: color === c ? '0 0 0 2px var(--cream), 0 0 0 3px rgba(150,130,110,0.3)' : 'none',
                transition: 'transform .15s',
                transform: color === c ? 'scale(1.12)' : 'none',
              }}
            />
          ))}
          <CustomColorSwatch color={color} onChange={setColor} />
        </div>
      </form>
      {error && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b' }}>{decodeURIComponent(error)}</p>
      )}
    </div>
  )
}
