import Link from 'next/link'
import { resetPasswordRequest } from '../actions'

const inputClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm text-center">
        <p className="text-green-700 font-medium mb-2">Email sent!</p>
        <p className="text-stone-500 text-sm">Check your inbox for a password reset link.</p>
        <Link href="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-800 mb-2">Reset password</h2>
      <p className="text-sm text-stone-500 mb-6">We&apos;ll send you a link to reset your password.</p>
      <form action={resetPasswordRequest} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        {error && <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>}
        <button type="submit" className="w-full mt-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
          Send reset link
        </button>
      </form>
      <p className="mt-5 text-sm text-center">
        <Link href="/login" className="text-indigo-600 hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}
