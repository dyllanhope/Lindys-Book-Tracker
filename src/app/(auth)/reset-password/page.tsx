import Link from 'next/link'
import { resetPasswordRequest } from '../actions'

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

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
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
        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginBottom: 10 }}>
          Email sent!
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Check your inbox for a password reset link.</p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: 20, fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
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
      <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginBottom: 6 }}>
        Reset password
      </div>
      <p style={{ fontSize: 14, color: 'var(--ink-light)', marginBottom: 20 }}>
        We&apos;ll send you a link to reset your password.
      </p>
      <form action={resetPasswordRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>Email</label>
          <input name="email" type="email" required style={inputStyle} />
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
          Send reset link
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: 'center' }}>
        <Link href="/login" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
