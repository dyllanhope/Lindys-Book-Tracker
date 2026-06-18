'use client'

import { useState, useTransition } from 'react'
import { setReadingGoal } from '@/app/(app)/dashboard/actions'

interface Props {
  year: number
  target: number | null
  finished: number
}

/** Compact reading-goal card for the desktop sidebar. Click to edit inline. */
export function SidebarGoal({ year, target, finished }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(target != null ? String(target) : '')
  const [pending, startTransition] = useTransition()

  function save() {
    const parsed = parseInt(value, 10)
    const next = Number.isFinite(parsed) && parsed > 0 ? parsed : null
    startTransition(async () => {
      await setReadingGoal(year, next)
      setEditing(false)
    })
  }

  const pct = target && target > 0 ? Math.min(100, Math.round((finished / target) * 100)) : 0

  const shell: React.CSSProperties = {
    background: 'linear-gradient(135deg, #EAF1E4 0%, #E8ECE4 100%)',
    borderRadius: 16,
    padding: '13px 15px',
  }
  const label: React.CSSProperties = {
    fontSize: 10, letterSpacing: '1.3px', textTransform: 'uppercase', color: '#8a9a86', fontWeight: 700,
  }

  if (editing) {
    return (
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <div style={shell}>
          <div style={label}>{year} goal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
              placeholder="books"
              style={{ width: 56, background: 'var(--card)', border: '1px solid rgba(123,150,107,0.4)', borderRadius: 8, padding: '5px 8px', fontSize: 13, color: '#4A3D35', outline: 'none', fontFamily: 'var(--font-mulish), sans-serif' }}
            />
            <button onClick={save} disabled={pending} style={{ background: '#7B966B', color: '#FEFAF3', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: pending ? 0.6 : 1 }}>
              {pending ? '…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setValue(target != null ? String(target) : '') }} style={{ background: 'transparent', border: 'none', color: '#B3A595', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '5px 2px' }}>✕</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px', marginBottom: 10 }}>
      <button onClick={() => setEditing(true)} style={{ ...shell, display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>
        <div style={label}>{year} goal</div>
        {target != null ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 27, color: '#4A3D35', fontWeight: 500, lineHeight: 1 }}>{finished}</span>
              <span style={{ fontSize: 12.5, color: '#94a08a', fontWeight: 500 }}>/ {target} books</span>
            </div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: 'rgba(123,150,107,0.2)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: '#7B966B', transition: 'width .3s' }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: '#7B966B', fontWeight: 600, marginTop: 6 }}>+ Set a goal</div>
        )}
      </button>
    </div>
  )
}
