import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function updateProfile(formData: FormData) {
  'use server'
  const username = (formData.get('username') as string).trim()
  if (username.length > 40) redirect('/account?error=Username+must+be+40+characters+or+fewer')
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ data: { username } })
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`)
  redirect('/account?success=profile')
}

async function changePassword(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string
  if (password !== confirm) redirect('/account?error=Passwords+do+not+match')
  if (password.length < 6) redirect('/account?error=Password+must+be+at+least+6+characters')
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`)
  redirect('/account?success=password')
}

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: finishedCount },
    { count: readingCount },
    { count: tbrCount },
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'finished'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'currently_reading'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('reading_status', 'not_started'),
  ])

  const username = (user?.user_metadata?.username as string | undefined)?.trim() || ''
  const displayName = username || user?.email || ''
  const initial = (displayName || 'R')[0].toUpperCase()

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

  return (
    <div style={{ padding: '62px 22px 16px' }} className="fade-up">
      {/* Avatar + name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 14 }}>
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 99,
            background: 'linear-gradient(135deg, #E9F0E3, #EDEBF1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 38,
            color: 'var(--sage)',
            boxShadow: '0 14px 28px -18px rgba(120,140,115,0.6)',
          }}
        >
          {initial}
        </div>
        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginTop: 16 }}>
          {displayName}
        </div>
        {username && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-light)', marginTop: 3 }}>{user?.email}</div>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: 26,
          background: 'linear-gradient(135deg, #E9F0E3, #EDEBF1)',
          borderRadius: 24,
          padding: 22,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {[
          { label: 'finished', val: finishedCount ?? 0 },
          { label: 'reading', val: readingCount ?? 0 },
          { label: 'to read', val: tbrCount ?? 0 },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 30, color: 'var(--sage)', lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontSize: 11, color: '#8a9a86', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Display name */}
      <div
        style={{
          marginTop: 24,
          background: 'var(--card)',
          borderRadius: 22,
          padding: '20px 18px',
          border: '1px solid rgba(150,130,110,0.08)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 6 }}>
          Display name
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-light)', marginBottom: 16 }}>
          Choose how your name appears across the app. Your email stays your login.
        </p>
        {success === 'profile' && (
          <p style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 14 }}>Display name updated.</p>
        )}
        <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            name="username"
            type="text"
            defaultValue={username}
            maxLength={40}
            placeholder="e.g. Lindy"
            style={inputStyle}
          />
          <button
            type="submit"
            style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mulish), sans-serif' }}
          >
            Save name
          </button>
        </form>
      </div>

      {/* Change password */}
      <div
        style={{
          marginTop: 16,
          background: 'var(--card)',
          borderRadius: 22,
          padding: '20px 18px',
          border: '1px solid rgba(150,130,110,0.08)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: 'var(--ink)', fontWeight: 500, marginBottom: 16 }}>
          Change password
        </div>
        {success === 'password' && (
          <p style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 14 }}>Password updated successfully.</p>
        )}
        <form action={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>New password</label>
            <input name="password" type="password" required minLength={6} autoComplete="new-password" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-light)', display: 'block', marginBottom: 6 }}>Confirm password</label>
            <input name="confirm" type="password" required autoComplete="new-password" style={inputStyle} />
          </div>
          {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{decodeURIComponent(error)}</p>}
          <button
            type="submit"
            style={{
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

      {/* Sign out */}
      <div style={{ marginTop: 16 }}>
        <form action={signOut}>
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(150,130,110,0.22)',
              borderRadius: 12,
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink-light)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mulish), sans-serif',
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
