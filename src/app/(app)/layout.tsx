import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Sidebar — fixed on desktop, hidden on mobile */}
      <div
        className="hidden md:block"
        style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 224, zIndex: 20 }}
      >
        <Sidebar />
      </div>

      {/* Main content — offset by sidebar on desktop, padded for bottom nav on mobile */}
      <main
        className="no-scrollbar pb-[88px] md:pb-[60px] md:pl-[224px]"
        style={{ minHeight: '100vh' }}
      >
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
