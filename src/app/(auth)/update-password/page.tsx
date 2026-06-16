import { updatePassword } from '../actions'

const inputClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full'

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-800 mb-6">Set new password</h2>
      <form action={updatePassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-stone-700">New password</label>
          <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
        </div>
        {error && <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>}
        <button type="submit" className="w-full mt-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
          Update password
        </button>
      </form>
    </div>
  )
}
