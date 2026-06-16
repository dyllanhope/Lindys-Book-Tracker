import Link from 'next/link'
import { signUp } from '../actions'

const inputClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm text-center">
        <p className="text-green-700 font-medium mb-2">Check your email!</p>
        <p className="text-stone-500 text-sm">
          We sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-800 mb-6">Create account</h2>
      <form action={signUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-stone-700">Password</label>
          <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
        </div>
        {error && <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>}
        <button type="submit" className="w-full mt-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
          Create account
        </button>
      </form>
      <p className="mt-5 text-sm text-center text-stone-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
