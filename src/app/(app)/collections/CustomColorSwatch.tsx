'use client'

import { useRef } from 'react'
import { SHELF_COLORS } from '@/lib/shelfColors'

const RAINBOW = 'conic-gradient(from 0deg, #e74c3c, #f1c40f, #2ecc71, #3498db, #9b59b6, #e74c3c)'

/**
 * A circular swatch that opens the OS colour wheel. Shows a rainbow when a
 * preset is selected (inviting a custom pick) and the chosen colour with a
 * ring once a custom colour is active.
 *
 * - `onChange` fires live as the colour is dragged in the OS picker (use it
 *   for previewing in local state).
 * - `onCommit` fires once when the picker closes, and only if the colour was
 *   actually changed (use it for persisting / submitting).
 */
export function CustomColorSwatch({
  color,
  onChange,
  onCommit,
}: {
  color: string
  onChange?: (hex: string) => void
  onCommit?: (hex: string) => void
}) {
  const isCustom = !SHELF_COLORS.includes(color)
  const dirty = useRef(false)
  return (
    <label
      title="Custom colour"
      style={{
        position: 'relative',
        width: 22,
        height: 22,
        borderRadius: 99,
        cursor: 'pointer',
        display: 'inline-block',
        background: isCustom ? color : RAINBOW,
        border: isCustom ? '2px solid var(--ink)' : '2px solid transparent',
        boxShadow: isCustom ? '0 0 0 2px var(--cream), 0 0 0 3px rgba(150,130,110,0.3)' : 'none',
        transform: isCustom ? 'scale(1.12)' : 'none',
      }}
    >
      <input
        type="color"
        value={isCustom ? color : '#c9845a'}
        onChange={(e) => {
          dirty.current = true
          onChange?.(e.target.value)
        }}
        onBlur={(e) => {
          if (!dirty.current) return
          dirty.current = false
          onCommit?.(e.target.value)
        }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 }}
      />
    </label>
  )
}
