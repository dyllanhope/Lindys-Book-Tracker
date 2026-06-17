'use client'

import { useEffect, useState } from 'react'

// Warm book-spine palette + heights for the hopping bars (from the prototype).
const SPINE_COLORS = ['#C3D4B0', '#F1C2A0', '#DBCFE9', '#BDE0D5', '#E6B9C3', '#F1C5A6', '#D7CFE9']
const SPINE_HEIGHTS = [52, 44, 60, 40, 56, 48, 54]

const PHRASES = [
  'Flipping through the stacks…',
  'Dusting off the shelves…',
  'Finding your next obsession…',
  'Consulting the card catalogue…',
  'Following the dog‑eared pages…',
]

const shimmer = (a: string, b: string): React.CSSProperties => ({
  background: `linear-gradient(90deg, ${a} 25%, ${b} 50%, ${a} 75%)`,
  backgroundSize: '200% 100%',
  animation: 'jrnlShimmer 1.3s ease-in-out infinite',
})

/**
 * The app-wide loading state: a shelf of book spines hopping in sequence with
 * drifting dust motes and a rotating library phrase, followed by shimmering
 * skeleton cards. Use anywhere content takes time to load.
 *
 * @param cards  number of skeleton cards to show beneath the animation (0 to hide)
 * @param phrase show the rotating italic phrase (default true)
 */
export function BookLoader({ cards = 3, phrase = true }: { cards?: number; phrase?: boolean }) {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    if (!phrase) return
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % PHRASES.length), 1900)
    return () => clearInterval(t)
  }, [phrase])

  return (
    <div className="fade-up" style={{ marginTop: 8 }}>
      {/* Hopping spines + dust + shelf line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6, height: 74 }}>
          {SPINE_COLORS.map((c, i) => (
            <div
              key={i}
              style={{
                flex: 'none',
                width: 14,
                height: SPINE_HEIGHTS[i],
                borderRadius: '3px 3px 1px 1px',
                background: `linear-gradient(155deg, ${c} 0%, ${c} 60%, rgba(74,61,53,0.12) 140%)`,
                boxShadow: 'inset -3px 0 6px -3px rgba(90,72,55,0.3), inset 2px 0 3px -1px rgba(255,253,246,0.5)',
                transformOrigin: 'bottom center',
                animation: 'jrnlHop 1.15s cubic-bezier(.4,0,.3,1) infinite',
                animationDelay: `${i * 0.11}s`,
              }}
            />
          ))}
          <span style={{ position: 'absolute', left: '30%', bottom: 62, width: 5, height: 5, borderRadius: 99, background: 'rgba(200,170,130,0.7)', ['--dx' as string]: '-10px', animation: 'jrnlDust 1.6s ease-in-out infinite', animationDelay: '0.2s' }} />
          <span style={{ position: 'absolute', left: '62%', bottom: 58, width: 4, height: 4, borderRadius: 99, background: 'rgba(200,170,130,0.6)', ['--dx' as string]: '12px', animation: 'jrnlDust 1.6s ease-in-out infinite', animationDelay: '0.8s' }} />
        </div>
        <div style={{ width: 170, height: 5, borderRadius: 99, marginTop: 3, background: 'linear-gradient(90deg,rgba(150,130,110,0) 0%,rgba(150,130,110,0.32) 20%,rgba(150,130,110,0.32) 80%,rgba(150,130,110,0) 100%)' }} />
        {phrase && (
          <div style={{ height: 24, marginTop: 18, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <span key={phraseIdx} style={{ fontFamily: 'var(--font-newsreader), serif', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-light)', animation: 'jrnlPhrase 1.9s ease both' }}>
              {PHRASES[phraseIdx]}
            </span>
          </div>
        )}
      </div>

      {/* Shimmer skeleton cards */}
      {cards > 0 && (
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: cards }).map((_, i) => {
            const delay: React.CSSProperties = { animationDelay: `${i * 0.18}s` }
            return (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--card)', borderRadius: 18, padding: 11, border: '1px solid rgba(150,130,110,0.08)' }}>
                <div style={{ flex: 'none', width: 54, height: 80, borderRadius: 9, ...shimmer('#EFE7D7', '#F8F2E6'), ...delay }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div style={{ height: 15, width: '72%', borderRadius: 99, ...shimmer('#EFE7D7', '#F8F2E6'), ...delay }} />
                  <div style={{ height: 12, width: '48%', borderRadius: 99, ...shimmer('#F0E8D8', '#F8F2E6'), ...delay }} />
                  <div style={{ height: 9, width: '30%', borderRadius: 99, ...shimmer('#F0E8D8', '#F8F2E6'), ...delay }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
