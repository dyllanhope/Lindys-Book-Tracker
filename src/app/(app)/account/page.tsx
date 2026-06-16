import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function changePassword(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string
  if (password !== confirm) redirect('/account?error=Passwords+do+not+match')
  if (password.length < 6) redirect('/account?error=Password+must+be+at+least+6+characters')
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`)
  redirect('/account?success=1')
}

const inputClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Account</h1>
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-800 mb-4">Change Password</h2>
        {success && <p className="text-sm text-green-700 mb-4">Password updated successfully.</p>}
        <form action={changePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">New password</label>
            <input name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Confirm password</label>
            <input name="confirm" type="password" required autoComplete="new-password" className={inputClass} />
          </div>
          {error && <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>}
          <button type="submit" className="rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
