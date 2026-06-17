export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 22px',
        background: 'radial-gradient(120% 90% at 50% 0%, #F1EADC 0%, #E9E1D2 60%, #E3DAC9 100%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontSize: 28,
              color: 'var(--ink)',
              fontWeight: 500,
            }}
          >
            Lindy&apos;s Books
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 4 }}>
            Your personal reading journal
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
