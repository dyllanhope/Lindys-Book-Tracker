import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from './SidebarNav'

export async function Sidebar() {
  const supabase = await createClient()
  const [
    { data: { user } },
    { count: finishedCount },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'finished'),
  ])

  const GOAL = 36
  const done = finishedCount ?? 0
  const pct = Math.min(100, Math.round((done / GOAL) * 100))
  const initial = (user?.email ?? 'R')[0].toUpperCase()
  const email = user?.email ?? ''

  return (
    <div
      style={{
        flexShrink: 0,
        width: 224,
        height: '100vh',
        background: '#FEFAF3',
        borderRight: '1px solid rgba(150,130,110,0.12)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 0 24px',
        overflow: 'hidden',
      }}
    >
      {/* Wordmark */}
      <div style={{ padding: '32px 28px 24px' }}>
        <div style={{ fontFamily: 'var(--font-newsreader), Georgia, serif', fontSize: 22, color: '#4A3D35', fontWeight: 500, letterSpacing: '-0.3px', lineHeight: 1 }}>
          Lindy&apos;s Books
        </div>
        <div style={{ fontSize: 10.5, color: '#B3A595', marginTop: 3, letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: 600 }}>
          Reading Journal
        </div>
      </div>

      {/* Nav */}
      <SidebarNav />

      {/* Reading goal */}
      <div style={{ margin: '0 16px 20px', background: 'linear-gradient(135deg,#E9F0E3,#EDEBF1)', borderRadius: 18, padding: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#8a9a86', fontWeight: 700 }}>
          2026 goal
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
          <span style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 24, color: '#5b7a5a', fontWeight: 500 }}>{done}</span>
          <span style={{ fontSize: 12, color: '#8a9a86', fontWeight: 600 }}>/ {GOAL} books</span>
        </div>
        <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.55)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'linear-gradient(90deg,#9ABD8C,#7aA86A)', transition: 'width .4s ease' }} />
        </div>
      </div>

      {/* Avatar */}
      <div style={{ padding: '0 16px' }}>
        <a
          href="/account"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 14,
            cursor: 'pointer',
            background: 'rgba(150,130,110,0.07)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              background: 'linear-gradient(135deg,#E9F0E3,#EDEBF1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-newsreader), serif',
              fontSize: 16,
              color: '#6f8a6c',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3D35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </div>
            <div style={{ fontSize: 11, color: '#B3A595', marginTop: 1 }}>{done} books read</div>
          </div>
        </a>
      </div>
    </div>
  )
}
