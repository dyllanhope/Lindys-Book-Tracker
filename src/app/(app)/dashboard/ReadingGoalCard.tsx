'use client'

import { useState, useTransition } from 'react'
import { setReadingGoal } from './actions'

interface Props {
  year: number
  target: number | null
  finished: number
}

export function ReadingGoalCard({ year, target, finished }: Props) {
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
  const remaining = target ? Math.max(0, target - finished) : 0
  const done = target != null && finished >= target

  // Donut geometry
  const R = 34
  const C = 2 * Math.PI * R
  const dash = (pct / 100) * C

  return (
    <div style={{ background: 'linear-gradient(135deg,#F5E8DC,#EFE2D2)', borderRadius: 22, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
      {/* Progress donut */}
      <div style={{ position: 'relative', flexShrink: 0, width: 84, height: 84 }}>
        <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(201,132,90,0.18)" strokeWidth="8" />
          <circle cx="42" cy="42" r={R} fill="none" stroke="#C9845A" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${C}`} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: '#9a5a36', fontWeight: 500, lineHeight: 1 }}>{finished}</span>
          {target != null && <span style={{ fontSize: 10.5, color: '#C9845A', fontWeight: 600 }}>of {target}</span>}
        </div>
      </div>

      {/* Copy + editor */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9845A', fontWeight: 700 }}>{year} reading goal</div>

        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save() }}
              placeholder="books"
              style={{ width: 78, background: 'var(--card)', border: '1px solid rgba(201,132,90,0.35)', borderRadius: 9, padding: '7px 10px', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-mulish), sans-serif' }}
            />
            <button onClick={save} disabled={pending} style={{ background: '#C9845A', color: 'var(--cream)', border: 'none', borderRadius: 9, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: pending ? 0.6 : 1 }}>
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setValue(target != null ? String(target) : '') }} style={{ background: 'transparent', border: 'none', color: '#B07A52', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : target != null ? (
          <>
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 19, color: 'var(--ink)', fontWeight: 500, marginTop: 4, lineHeight: 1.2 }}>
              {done ? 'Goal reached — bravo! 🎉' : `${remaining} ${remaining === 1 ? 'book' : 'books'} to go`}
            </div>
            <button onClick={() => setEditing(true)} style={{ marginTop: 6, background: 'transparent', border: 'none', padding: 0, color: '#C9845A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Edit goal</button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginTop: 4, lineHeight: 1.2 }}>
              Set a goal for the year
            </div>
            <button onClick={() => setEditing(true)} style={{ marginTop: 6, background: 'transparent', border: 'none', padding: 0, color: '#C9845A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>+ Set goal</button>
          </>
        )}
      </div>
    </div>
  )
}
