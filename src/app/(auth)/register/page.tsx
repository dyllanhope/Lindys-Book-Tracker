import Link from 'next/link'
import { signUp } from '../actions'

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

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams

  if (success) {
    return (
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: '0 20px 40px -20px rgba(90,72,55,0.3)',
          border: '1px solid rgba(150,130,110,0.08)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginBottom: 12 }}>
          Check your email!
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-light)', lineHeight: 1.6 }}>
          We sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link
          href="/login"
          style={{ display: 'inline-block', marginTop: 20, fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
        >
          Back to sign in
        </Link>
      </div>
    )
  }

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
        Create account
      </div>
      <form action={signUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>Email</label>
          <input name="email" type="email" required autoComplete="email" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>Password</label>
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
            marginTop: 4,
            fontFamily: 'var(--font-mulish), sans-serif',
          }}
        >
          Create account
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-light)', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
