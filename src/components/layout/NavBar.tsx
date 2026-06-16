'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/library', label: 'Library' },
  { href: '/search', label: 'Search' },
  { href: '/collections', label: 'Collections' },
]

export function NavBar() {
  const pathname = usePathname()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b border-stone-200 bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-indigo-600 mr-3">📚 Book Tracker</span>
          <div className="hidden sm:flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(l.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === '/account' ? 'bg-indigo-50 text-indigo-700' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Account
          </Link>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden border-t border-stone-100 flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
              pathname.startsWith(l.href) ? 'text-indigo-700 border-b-2 border-indigo-600' : 'text-stone-500'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
