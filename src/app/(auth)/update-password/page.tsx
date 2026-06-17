import { updatePassword } from '../actions'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--card)',
  border: '1px solid rgba(150,130,110,0.22)',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'var(--font-mulish), sans-serif',
}

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: 24,
        padding: '28px 24px',
        boxShadow: '0 20px 40px -20px rgba(90,72,55,0.3)',
        border: '1px solid rgba(150,130,110,0.08)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginBottom: 22 }}>
        Set new password
      </div>
      <form action={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>New password</label>
          <input name="password" type="password" required minLength={6} autoComplete="new-password" style={inputStyle} />
        </div>
        {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{decodeURIComponent(error)}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: 'none',
            borderRadius: 12,
            padding: '12px 0',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-mulish), sans-serif',
          }}
        >
          Update password
        </button>
      </form>
    </div>
  )
}
