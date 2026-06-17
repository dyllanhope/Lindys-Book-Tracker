import Link from 'next/link'
import { signIn } from '../actions'

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

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
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
        Sign in
      </div>
      <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>Email</label>
          <input name="email" type="email" required autoComplete="email" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>Password</label>
          <input name="password" type="password" required autoComplete="current-password" style={inputStyle} />
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
            marginTop: 4,
            fontFamily: 'var(--font-mulish), sans-serif',
          }}
        >
          Sign in
        </button>
      </form>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
        <Link href="/reset-password" style={{ fontSize: 13, color: 'var(--ink-light)', textDecoration: 'none' }}>
          Forgot password?
        </Link>
        <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Register
          </Link>
        </span>
      </div>
    </div>
  )
}
