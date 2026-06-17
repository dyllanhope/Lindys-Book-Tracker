'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/>
      </svg>
    ),
  },
  {
    href: '/library',
    label: 'Library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4.5h3.5v15H5z"/><path d="M9.5 4.5H13v15H9.5z"/><path d="m15 6 3 .6-2.6 13L13 19"/>
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Discover',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>
      </svg>
    ),
  },
  {
    href: '/collections',
    label: 'Shelves',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/>
        <rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>
      </svg>
    ),
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
      {LINKS.map((link) => {
        const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 14px',
              borderRadius: 14,
              cursor: 'pointer',
              transition: 'all .2s',
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              color: active ? '#4A3D35' : '#A8978A',
              background: active ? 'rgba(219,138,106,0.1)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            <span style={{ flex: 'none', color: active ? '#DB8A6A' : '#C9BCAE' }}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
